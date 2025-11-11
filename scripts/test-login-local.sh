#!/bin/bash

# Script de Teste do Fluxo de Login Local
# Verifica configurações e testa o fluxo de autenticação

set -e

echo "🧪 Teste do Fluxo de Login Local - GoalFlow"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto studio/${NC}"
    exit 1
fi

echo "📋 Verificando configurações..."
echo ""

# Verificar .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ Arquivo .env.local encontrado${NC}"
    
    # Verificar variáveis necessárias
    REQUIRED_VARS=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env.local; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ Todas as variáveis necessárias estão presentes${NC}"
    else
        echo -e "${YELLOW}⚠️ Variáveis faltando:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo "   - $var"
        done
    fi
else
    echo -e "${RED}❌ Arquivo .env.local não encontrado${NC}"
    echo "   Criando arquivo .env.local com valores padrão..."
    cat > .env.local << 'EOF'
# Firebase Client SDK Configuration (desenvolvimento local)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyALRps1FyfrS8P3SxTEhpU-0m3Mb58k_1w
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=magnetai-4h4a8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=magnetai-4h4a8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=magnetai-4h4a8.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=210739580533
NEXT_PUBLIC_FIREBASE_APP_ID=1:210739580533:web:90a7f1063949457ded723c
EOF
    echo -e "${GREEN}✅ Arquivo .env.local criado${NC}"
fi

echo ""
echo "📦 Verificando dependências..."
echo ""

# Verificar node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules encontrado${NC}"
else
    echo -e "${YELLOW}⚠️ node_modules não encontrado. Execute: npm install${NC}"
fi

# Verificar Firebase
if [ -d "node_modules/firebase" ]; then
    echo -e "${GREEN}✅ Firebase instalado${NC}"
else
    echo -e "${RED}❌ Firebase não instalado. Execute: npm install${NC}"
fi

echo ""
echo "🌐 Verificando configuração do Firebase..."
echo ""

# Verificar se localhost está autorizado (instrução manual)
echo -e "${YELLOW}⚠️ Verifique manualmente se 'localhost' está nos domínios autorizados:${NC}"
echo "   https://console.firebase.google.com/project/magnetai-4h4a8/authentication/settings"
echo ""

echo "🚀 Próximos passos:"
echo ""
echo "1. Inicie o servidor de desenvolvimento:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "2. Abra no navegador:"
echo "   ${GREEN}http://localhost:3000/login${NC}"
echo ""
echo "3. Teste o login:"
echo "   - Clique em 'Entrar com Google'"
echo "   - Autorize o acesso"
echo "   - Verifique se redireciona para a home"
echo ""
echo "4. Verifique o console do navegador (F12) para erros"
echo ""
echo "📚 Documentação completa:"
echo "   - docs/TESTE_LOGIN_LOCAL.md"
echo "   - docs/COMPARACAO_LOCAL_PRODUCAO.md"
echo ""

