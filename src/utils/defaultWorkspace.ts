import { FileNode } from '../types/vscode';

export const INITIAL_WORKSPACE_FILES: FileNode[] = [
  {
    id: 'folder-src',
    name: 'src',
    path: 'src',
    type: 'folder',
    parentId: null,
    isOpen: true,
  },
  {
    id: 'file-main-py',
    name: 'main.py',
    path: 'src/main.py',
    type: 'file',
    language: 'python',
    parentId: 'folder-src',
    content: `# ==========================================================
# 🧠 Kilo Code AI & Google Colab Machine Learning Pipeline
# ==========================================================
import sys
import time
import math

def check_colab_environment():
    """Detects available hardware accelerations (GPU/TPU/CPU)."""
    print("🔍 [Colab Runtime] Verificando ambiente de execução...")
    try:
        import torch
        if torch.cuda.is_available():
            device_name = torch.cuda.get_device_name(0)
            mem_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
            print(f"🚀 [Acelerador] GPU Detectada: {device_name} ({mem_gb:.2f} GB VRAM)")
            return torch.device("cuda")
        else:
            print("💻 [Acelerador] Rodando em CPU (GPU desativada no Colab)")
            return torch.device("cpu")
    except ImportError:
        print("ℹ️ PyTorch não importado. Usando modo simulação puro Python.")
        return "cpu"

def train_synthetic_model(epochs: int = 5, learning_rate: float = 0.001):
    """Simulates training a deep neural network with live metrics."""
    print(f"\\n🎯 Iniciando treinamento: {epochs} épocas | LR = {learning_rate}")
    loss = 2.450
    accuracy = 0.125
    
    for epoch in range(1, epochs + 1):
        time.sleep(0.4)  # Simula tempo de processamento do batch
        # Reduz loss progressivamente
        decay = math.exp(-epoch / 2.5)
        loss = round(0.18 + decay * 1.8 + (0.02 * (epoch % 2)), 4)
        accuracy = round(min(0.985, 0.35 + (1 - decay) * 0.6 + (0.01 * (epoch % 3))), 3)
        
        bar_len = 20
        progress = int((epoch / epochs) * bar_len)
        progress_bar = "█" * progress + "░" * (bar_len - progress)
        
        print(f"Época [{epoch:02d}/{epochs:02d}] [{progress_bar}] Loss: {loss:.4f} | Acurácia: {accuracy * 100:.1f}%")

    print("\\n✅ Treinamento concluído com sucesso!")
    print(f"🏆 Melhor Validação - Acurácia: {accuracy * 100:.1f}% | Loss Final: {loss:.4f}")
    return {"final_loss": loss, "final_accuracy": accuracy}

if __name__ == "__main__":
    device = check_colab_environment()
    metrics = train_synthetic_model(epochs=6, learning_rate=0.0005)
    print(f"📊 Resumo dos resultados: {metrics}")
`,
  },
  {
    id: 'file-model-py',
    name: 'model.py',
    path: 'src/model.py',
    type: 'file',
    language: 'python',
    parentId: 'folder-src',
    content: `# ==========================================================
# 🧱 Arquitetura de Rede Neural (PyTorch / Colab Ready)
# ==========================================================
"""
Módulo de definição de modelo neural para classificação de imagens ou dados tabulares.
Você pode pedir ao Kilo Code AI para refatorar para ResNet, Vision Transformer ou MLP.
"""

class SimpleNeuralClassifier:
    def __init__(self, input_dim: int = 128, hidden_dim: int = 64, num_classes: int = 10):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_classes = num_classes
        self.parameters_count = (input_dim * hidden_dim) + (hidden_dim * num_classes)
        print(f"🔧 Modelo Inicializado com {self.parameters_count:,} parâmetros.")

    def forward(self, x):
        """Passagem direta (Forward pass)"""
        print(f"🔄 Executando forward pass para tensor com shape ({len(x) if hasattr(x, '__len__') else 1}, {self.input_dim})")
        return {"output_classes": self.num_classes, "status": "computed"}

    def summary(self):
        """Retorna resumo da arquitetura do modelo."""
        return f"""
----------------------------------------------------------------
Layer (type)              Output Shape         Param #
================================================================
Linear-1 (Dense)          [-1, {self.hidden_dim}]               {self.input_dim * self.hidden_dim}
ReLU                      [-1, {self.hidden_dim}]               0
Dropout (0.2)             [-1, {self.hidden_dim}]               0
Linear-2 (Classifier)     [-1, {self.num_classes}]                {self.hidden_dim * self.num_classes}
================================================================
Total params: {self.parameters_count:,}
Trainable params: {self.parameters_count:,}
Non-trainable params: 0
----------------------------------------------------------------
"""

if __name__ == "__main__":
    net = SimpleNeuralClassifier()
    print(net.summary())
`,
  },
  {
    id: 'file-colab-notebook',
    name: 'colab_setup.ipynb',
    path: 'colab_setup.ipynb',
    type: 'file',
    language: 'json',
    parentId: null,
    content: `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# 🚀 Google Colab + Kilo Code AI Quickstart\\n",
    "Este notebook demonstra a integração do editor VS Code Web com o runtime do Google Colab com GPU acelerada."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 1,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 1. Verificar GPU NVIDIA\\n",
    "!nvidia-smi"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 2,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 2. Instalar dependências rápidas\\n",
    "!pip install -q torch torchvision matplotlib pandas seaborn"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": 3,
   "metadata": {},
   "outputs": [],
   "source": [
    "# 3. Executar script de treinamento\\n",
    "!python src/main.py"
   ]
  }
 ],
 "metadata": {
  "accelerator": "GPU",
  "colab": {
   "provenance": []
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 0
}`,
  },
  {
    id: 'file-requirements',
    name: 'requirements.txt',
    path: 'requirements.txt',
    type: 'file',
    language: 'plaintext',
    parentId: null,
    content: `torch>=2.2.0
torchvision>=0.17.0
numpy>=1.24.0
pandas>=2.1.0
matplotlib>=3.8.0
tqdm>=4.66.0
scikit-learn>=1.4.0
requests>=2.31.0
`,
  },
  {
    id: 'file-readme',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    language: 'markdown',
    parentId: null,
    content: `# 💻 VS Code Web + Kilo Code AI (Colab Edition)

Ambiente completo de desenvolvimento estilo **VS Code** compatível com Desktop e Mobile, com edição em tempo real, terminal interativo e integração direta com o assistente **Kilo Code AI**.

---

### ✨ Funcionalidades Principais

1. **🎨 Temas Profissionais (Dark & Light)**
   - Dark+ (Default), Light+, Dracula, One Dark Pro, GitHub Dark, GitHub Light, Monokai e Tokyo Night.

2. **🤖 Kilo Code AI Assistant**
   - Suporte a modelos gratuitos (Gemini 3.7 Flash, Gemini 3.1 Flash Lite, DeepSeek Coder V3, Qwen 2.5 Coder, Llama 3.3 70B e Ollama Local).
   - **Autonomia de Código**: O Kilo Code escreve e edita arquivos diretamente no seu workspace com revisão de diff side-by-side e botão de aplicar com 1 clique!
   - Contexto multi-arquivos com marcação \`@nome_do_arquivo\`.

3. **⚡ Execução Google Colab & Terminal**
   - Terminal interativo com suporte a comandos Python e mágicas do Colab (\`!pip\`, \`!nvidia-smi\`, \`!ls\`, \`%time\`).
   - Snippet de 1 clique para parear com qualquer notebook do Google Colab.
   - Motor de execução WebAssembly Python para testar scripts instantaneamente sem sair do navegador.

4. **📱 Barra de Acessórios Mobile para Programação**
   - Teclado flutuante com caracteres especiais (\`{\`, \`}\`, \`[\`, \`]\`, \`(\`, \`)\`, \`:\`, \`;\`, \`=\`, \`<\`, \`>\`, indentação, undo/redo).

---
*Desenvolvido com padrão VS Code para a comunidade de Inteligência Artificial e Ciência de Dados.*
`,
  },
];
