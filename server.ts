import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Available Kilo Code / AI Models
app.get("/api/kilo/models", (req, res) => {
  res.json({
    models: [
      {
        id: "gemini-3.7-flash",
        name: "Gemini 3.7 Flash (Default / High Speed)",
        provider: "google",
        free: true,
        recommended: true,
        contextLength: "1M tokens",
        description: "Google's hybrid reasoning model, optimized for code generation and multi-file reasoning.",
      },
      {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite (Ultra Low Latency)",
        provider: "google",
        free: true,
        recommended: false,
        contextLength: "1M tokens",
        description: "Lightweight and ultra-fast for inline suggestions, autocomplete, and quick fixes.",
      },
      {
        id: "deepseek-coder-v3",
        name: "DeepSeek Coder V3 (Free Router)",
        provider: "kilo-openrouter",
        free: true,
        recommended: true,
        contextLength: "64k tokens",
        description: "Specialized open-weights coding model with high benchmark scores on Python & Colab tasks.",
      },
      {
        id: "qwen-2.5-coder-32b",
        name: "Qwen 2.5 Coder 32B Instruct",
        provider: "kilo-openrouter",
        free: true,
        recommended: false,
        contextLength: "32k tokens",
        description: "State-of-the-art multilingual and multi-framework code synthesis model.",
      },
      {
        id: "llama-3.3-70b-instruct",
        name: "Llama 3.3 70B Instruct (Free)",
        provider: "kilo-openrouter",
        free: true,
        recommended: false,
        contextLength: "128k tokens",
        description: "General intelligence with deep reasoning across data science and machine learning pipelines.",
      },
      {
        id: "custom-colab-ollama",
        name: "Local Colab / Ollama Endpoint",
        provider: "custom",
        free: true,
        recommended: false,
        contextLength: "Custom",
        description: "Connect to your custom Ollama / vLLM / llama.cpp instance running in your Google Colab.",
      }
    ],
  });
});

// AI Chat & Code Generation Handler
app.post("/api/kilo/chat", async (req, res) => {
  const {
    messages = [],
    model = "gemini-3.7-flash",
    workspaceFiles = [],
    activeFile = null,
    temperature = 0.2,
    customApiKey = null,
    customBaseUrl = null,
  } = req.body;

  // System instruction with Kilo Code Agent protocol
  const systemInstruction = `Você é o Kilo Code AI, um assistente de desenvolvimento inteligente, profissional e autônomo integrado a um ambiente VS Code para Google Colab & Web.

Suas capacidades principais:
1. Analisar, criar, refatorar e editar arquivos no workspace do usuário.
2. Escrever código limpo, modular, com tratamento de erros e suporte total ao ecossistema Python, Google Colab (GPU/TPU, PyTorch, TensorFlow, Hugging Face, Pandas, Matplotlib, Seaborn, etc.), JavaScript/TypeScript e shell scripts.
3. Quando você for instruído a criar ou modificar arquivos no projeto, utilize a sintaxe de bloco de ação para que o VS Code possa aplicar as alterações automaticamente com 1 clique ou diretamente:

Exemplo de bloco para criar ou substituir arquivo inteiro:
\`\`\`action:write_file
path: nome_do_arquivo.py
conteudo aqui...
\`\`\`

Exemplo de bloco para editar trechos específicos ou patch:
\`\`\`action:edit_file
path: nome_do_arquivo.py
search: <<<<<<< SEARCH
código antigo a substituir
=======
código novo modificado
>>>>>>> REPLACE
\`\`\`

Exemplo de bloco para executar comando no terminal / Colab:
\`\`\`action:colab_run
!pip install -q transformers torch
\`\`\`

Regras fundamentais:
- Responda em português (ou no idioma da solicitação do usuário) de forma clara, técnica e objetiva.
- Sempre explique brevemente o que foi feito antes ou depois dos blocos de código.
- Se o usuário pedir para converter para Google Colab, inclua células mágicas como '!pip install', '%matplotlib inline', verificação de GPU 'torch.cuda.is_available()' se aplicável.
- Mantenha boas práticas de programação, código comentado e tipagens PEP 484 em Python.`;

  try {
    // Check if user is using Gemini model
    if (model.startsWith("gemini-") || !customBaseUrl) {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "API Key não configurada. Defina a GEMINI_API_KEY no ambiente ou informe nas Configurações do Kilo Code.",
        });
      }

      const client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Prepare context of workspace
      let contextPrompt = "";
      if (workspaceFiles && workspaceFiles.length > 0) {
        contextPrompt += "\n\n=== ESTRUTURA E ARQUIVOS DO WORKSPACE ATUAL ===\n";
        for (const file of workspaceFiles.slice(0, 15)) {
          contextPrompt += `\n--- ARQUIVO: ${file.path} (${file.language || "text"}) ---\n${file.content?.slice(0, 3000) || ""}\n`;
        }
      }

      if (activeFile) {
        contextPrompt += `\n\n=== ARQUIVO ATUALMENTE ABERTO NO EDITOR: ${activeFile.path} ===\n${activeFile.content || ""}\n`;
      }

      // Format history messages
      const userMessage = messages[messages.length - 1]?.content || "Olá";
      const promptWithContext = `${contextPrompt}\n\n=== SOLICITAÇÃO DO USUÁRIO ===\n${userMessage}`;

      // Set headers for streaming SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const geminiModel = model.startsWith("gemini-") ? model : "gemini-3.7-flash";

      const streamResponse = await client.models.generateContentStream({
        model: geminiModel,
        contents: promptWithContext,
        config: {
          systemInstruction,
          temperature,
        },
      });

      for await (const chunk of streamResponse) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    // Fallback: If custom OpenAI-compatible endpoint is configured
    if (customBaseUrl) {
      const response = await fetch(`${customBaseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customApiKey || "free"}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            ...messages,
          ],
          stream: false,
          temperature,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({ error: errText });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sem resposta do modelo.";
      return res.json({ reply });
    }

    res.status(400).json({ error: "Configuração de modelo inválida." });
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || "Erro interno ao processar requisição com Kilo Code AI.",
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message || "Erro na geração" })}\n\n`);
      res.end();
    }
  }
});

// Colab Bridge Python Script generator
app.get("/api/colab/script", (req, res) => {
  const script = `# ==========================================================
# 🚀 KILO CODE + VS CODE GOOGLE COLAB BRIDGE
# Cole e execute este bloco em uma célula do Google Colab
# ==========================================================

import sys
import os
import json
import subprocess

print("📦 Configurando ambiente Kilo Code para Google Colab...")

try:
    import torch
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU (Sem GPU)"
    print(f"⚡ Dispositivo detectado: {gpu_name}")
except Exception as e:
    print("ℹ️ PyTorch não detectado ou padrão CPU.")

print("\\n✨ Servidor Colab pronto para receber comandos do VS Code Web!")
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(script);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VS Code Web + Kilo Code server running on http://localhost:${PORT}`);
  });
}

startServer();
