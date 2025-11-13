# Fix: Arquivos Estáticos 404 no Next.js

## Problema

Os arquivos estáticos do Next.js estão retornando 404:
- `/_next/static/chunks/main-app.js` - 404
- `/_next/static/chunks/app/page.js` - 404
- `/_next/static/css/app/layout.css` - 404

## Causa

O servidor Next.js está rodando, mas os arquivos estáticos não estão sendo gerados corretamente ou há um problema de cache.

## Solução

### 1. Limpar cache e reiniciar

```bash
cd /Users/rafaelsouza/Development/GCP/studio

# Parar servidor
pkill -9 -f "next dev"

# Limpar cache
rm -rf .next node_modules/.cache

# Reiniciar servidor
PORT=8000 npm run dev
```

### 2. Verificar se os arquivos estão sendo gerados

```bash
# Aguardar compilação completa (pode levar 30-60 segundos)
sleep 30

# Verificar arquivos gerados
ls -la .next/static/chunks/
ls -la .next/static/css/
```

### 3. Se ainda não funcionar, fazer build completo

```bash
# Fazer build de produção para verificar se há erros
npm run build

# Se build funcionar, usar modo produção localmente
npm start
```

### 4. Verificar configuração do Next.js

O arquivo `next.config.js` está configurado corretamente. Verifique se não há conflitos.

## Status Atual

- ✅ Servidor rodando na porta 8000
- ✅ `webpack.js` está sendo servido (200 OK)
- ❌ `main-app.js` não está sendo gerado
- ❌ Arquivos do App Router não estão sendo gerados

## Próximos Passos

1. Aguardar compilação completa do Next.js (pode levar até 1 minuto)
2. Verificar logs do servidor para erros de compilação
3. Se necessário, fazer build completo para identificar problemas

