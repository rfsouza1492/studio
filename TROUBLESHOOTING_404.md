# 🔍 Guia de Troubleshooting para Erros 404

## Como Verificar Erros 404 no Navegador

### Passo 1: Abrir Chrome DevTools
- Pressione `F12` ou `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Option+I` (Mac)
- Ou clique com botão direito → "Inspect"

### Passo 2: Verificar Aba Network
1. Clique na aba **"Network"**
2. Recarregue a página (`Ctrl+R` ou `Cmd+R`)
3. Procure por requisições destacadas em **vermelho**
4. A coluna **"Status"** mostrará `404 Not Found` para recursos não encontrados

### Passo 3: Identificar o Recurso Problemático
1. Clique na requisição com status 404
2. Veja a aba **"Headers"** para o **Request URL** completo
3. Tente abrir essa URL diretamente em uma nova aba do navegador
4. Se ainda mostrar 404, o caminho está realmente quebrado

## Problemas Comuns e Soluções

### 1. Arquivos Estáticos do Next.js (/_next/static/*)

**Sintoma**: Erros 404 para arquivos como:
- `/_next/static/chunks/main-app.js`
- `/_next/static/chunks/webpack.js`
- `/_next/static/css/app/layout.css`

**Causas Possíveis**:
- Cache corrompido do Next.js
- Servidor não compilou completamente
- Modo desenvolvimento com problemas de webpack

**Soluções**:

#### Solução A: Limpar Cache e Recompilar
```bash
cd /Users/rafaelsouza/Development/GCP/studio

# Parar servidor
pkill -9 -f "next"

# Limpar cache
rm -rf .next node_modules/.cache .swc

# Recompilar
npm run build

# Iniciar servidor de produção
PORT=8000 npm start
```

#### Solução B: Usar Modo Desenvolvimento (se funcionar)
```bash
cd /Users/rafaelsouza/Development/GCP/studio

# Limpar cache
rm -rf .next node_modules/.cache

# Iniciar em modo desenvolvimento
PORT=8000 npm run dev

# Aguardar 30-60 segundos para compilação completa
```

### 2. Recursos Personalizados (imagens, fontes, etc.)

**Sintoma**: Erros 404 para arquivos em `/public/` ou `/assets/`

**Verificação**:
```bash
# Verificar se arquivo existe
ls -la /Users/rafaelsouza/Development/GCP/studio/public/nome-do-arquivo.ext

# Verificar caminho no código
grep -r "nome-do-arquivo.ext" src/
```

**Soluções**:
- Verificar se o caminho está correto (case-sensitive)
- Verificar se o arquivo está na pasta `public/` (Next.js serve automaticamente)
- Verificar se não há espaços ou caracteres especiais no nome

### 3. APIs ou Rotas Backend

**Sintoma**: Erros 404 para endpoints como `/api/*`

**Verificação**:
```bash
# Verificar se backend está rodando
curl http://localhost:8080/api/v1/status

# Verificar rotas disponíveis
curl http://localhost:8080/api/info
```

**Soluções**:
- Verificar se o servidor backend está rodando (`goflow`)
- Verificar se a URL da API está correta no código
- Verificar variável de ambiente `NEXT_PUBLIC_API_URL`

## Checklist de Diagnóstico

Use este checklist para diagnosticar problemas 404:

- [ ] **Servidor está rodando?**
  ```bash
  lsof -i :8000  # Frontend
  lsof -i :8080  # Backend
  ```

- [ ] **Arquivo existe no sistema de arquivos?**
  ```bash
  find .next/static -name "arquivo-procurado.*"
  ```

- [ ] **Caminho está correto no código?**
  ```bash
  grep -r "caminho-do-arquivo" src/
  ```

- [ ] **Cache está limpo?**
  ```bash
  rm -rf .next node_modules/.cache
  ```

- [ ] **Build foi feito recentemente?**
  ```bash
  npm run build
  ```

- [ ] **Variáveis de ambiente estão configuradas?**
  ```bash
  cat .env | grep NEXT_PUBLIC
  ```

## Comandos Úteis

### Verificar Status dos Servidores
```bash
# Frontend
curl -I http://localhost:8000

# Backend
curl -I http://localhost:8080/api/v1/status
```

### Verificar Arquivos Estáticos Gerados
```bash
cd /Users/rafaelsouza/Development/GCP/studio
find .next/static -type f | head -20
```

### Verificar Logs do Servidor
```bash
# Logs do Next.js (se rodando em background)
tail -50 /tmp/nextjs.log

# Logs do GoFlow (se rodando em background)
tail -50 /tmp/goflow.log
```

### Limpar Tudo e Reiniciar
```bash
cd /Users/rafaelsouza/Development/GCP/studio

# Parar tudo
pkill -9 -f "next"
pkill -9 -f "node index.js"

# Limpar
rm -rf .next node_modules/.cache .swc

# Rebuild
npm run build

# Iniciar produção
PORT=8000 npm start
```

## Status Atual do Projeto

✅ **Backend (goflow)**: Rodando em `http://localhost:8080`
✅ **Frontend (studio)**: Rodando em `http://localhost:8000` (modo produção)
✅ **Arquivos estáticos**: Sendo servidos corretamente
✅ **Testes**: Todos passando (187 testes)

## Se Ainda Houver Problemas

1. **Verifique os logs do navegador** (Console tab no DevTools)
2. **Verifique os logs do servidor** (terminal onde está rodando)
3. **Tente acessar o arquivo diretamente** pela URL completa
4. **Limpe o cache do navegador** (Ctrl+Shift+Delete ou Cmd+Shift+Delete)
5. **Tente em modo anônimo/privado** para descartar extensões do navegador

---

**Última atualização**: 12 de Novembro, 2025
**Status**: ✅ Sistema funcionando corretamente

