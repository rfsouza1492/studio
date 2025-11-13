# Criar Índice do Firestore - Instruções

**Data:** 2025-11-12  
**Status:** ⚠️ Índice necessário para collection group query

---

## 🎯 Ação Necessária

O Firestore precisa de um índice para a query `collectionGroup('tasks').where('userId', '==', uid)`.

---

## 🚀 Solução Rápida (1 clique)

### Clicar no Link

**Link direto para criar o índice:**

https://console.firebase.google.com/v1/r/project/magnetai-4h4a8/firestore/indexes?create_exemption=ClBwcm9qZWN0cy9tYWduZXRhaS00aDRhOC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGFza3MvZmllbGRzL3VzZXJJZBACGgoKBnVzZXJJZBAB

### Passos

1. **Clicar no link acima** (já abre no navegador)
2. **Fazer login** no Firebase (se necessário)
3. **Clicar em "Create Index"** ou "Enable"
4. **Aguardar** 5-10 minutos para o índice ser construído
5. **Fazer hard refresh** na aplicação (Cmd+Shift+R)
6. **Testar** — tasks devem carregar sem erro

---

## 📋 Configuração do Índice

### Detalhes

- **Collection ID:** tasks
- **Query scope:** Collection group
- **Fields indexed:**
  - `userId` → Ascending

### Por Que É Necessário

A aplicação usa esta query:

```typescript
const tasksQuery = query(
  collectionGroup(firestore, 'tasks'),  // Busca em TODAS as subcoleções tasks
  where('userId', '==', user.uid)       // Filtra por userId
);
```

**Collection group queries** com filtros requerem índices compostos no Firestore.

---

## ⏱️ Tempo de Construção

- **Criação:** Instantânea (clique no botão)
- **Construção:** 5-10 minutos
- **Status:** Aparece como "Building..." depois "Enabled"

---

## 🔍 Verificar Status do Índice

### Via Console

1. Acesse: https://console.firebase.google.com/project/magnetai-4h4a8/firestore/indexes
2. Procure por índice "tasks" com campo "userId"
3. Status deve estar "Enabled" (verde)

### Via CLI

```bash
gcloud firestore indexes composite list --project=magnetai-4h4a8
```

---

## ✅ Após Criar o Índice

1. **Aguardar** status "Enabled" no console
2. **Fazer hard refresh** na aplicação (Cmd+Shift+R)
3. **Fazer login** novamente
4. **Verificar** que tasks carregam sem erro

---

## 🐛 Outros Erros no Console

### 1. "Uncaught (in promise) timeout"
- **O que é:** Timeout do popup de autenticação
- **Impacto:** Baixo (fallback para redirect já implementado)
- **Ação:** Ignorar

### 2. "Message port closed"
- **O que é:** Extensão do navegador
- **Impacto:** Nenhum
- **Ação:** Ignorar

---

## 📊 Checklist

- [ ] Clicar no link para criar índice
- [ ] Aguardar status "Enabled" (5-10 min)
- [ ] Fazer hard refresh na aplicação
- [ ] Verificar que tasks carregam
- [ ] Confirmar que erro desapareceu

---

**Próxima Ação:** Clicar no link acima para criar o índice  
**Tempo Estimado:** 5-10 minutos até ficar pronto
