# Correção: Índice do Firestore Ausente

**Data:** 2025-10-02  
**Erro:** `The query requires a COLLECTION_GROUP_ASC index for collection tasks and field userId`

---

## 🔍 Problema Identificado

O Firestore precisa de um índice composto para executar a query `collectionGroup('tasks').where('userId', '==', uid)`.

### Erro Completo
```
FirebaseError: The query requires a COLLECTION_GROUP_ASC index for collection 
tasks and field userId. You can create it here: https://console.firebase.google.com/...
```

---

## ✅ Solução

### Opção 1: Criar Índice via Console (Recomendado)

1. **Clicar no link fornecido no erro:**
   ```
   https://console.firebase.google.com/v1/r/project/magnetai-4h4a8/firestore/indexes?create_exemption=...
   ```

2. **Ou acessar manualmente:**
   - Ir para [Firebase Console](https://console.firebase.google.com/)
   - Projeto: `magnetai-4h4a8`
   - Firestore Database → Indexes
   - Clicar em "Create Index"

3. **Configurar o índice:**
   - Collection ID: `tasks` (Collection group)
   - Scope: `Collection group`
   - Fields to index:
     - `userId` → Ascending
   - Query scope: `Collection group`

4. **Salvar e aguardar:**
   - O Firestore leva alguns minutos para construir o índice
   - Status aparecerá como "Building..." e depois "Enabled"

### Opção 2: Criar via CLI

```bash
# Criar arquivo firestore.indexes.json
cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
EOF

# Deploy dos índices
firebase deploy --only firestore:indexes
```

### Opção 3: firestore.indexes.json (Já Configurado)

O arquivo de configuração de índices deve estar em `studio/firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 🎯 Por Que o Índice É Necessário?

### Query que Requer o Índice

**Arquivo:** `src/context/GoalContext.tsx:145`

```typescript
const tasksQuery = query(
  collectionGroup(firestore, 'tasks'),  // Collection group query
  where('userId', '==', user.uid)       // Filtro por userId
);
```

### Explicação

1. **Collection Group Query:** Busca em todas as subcoleções `tasks` em todos os goals
2. **Filtro:** Apenas tasks do usuário autenticado
3. **Índice Necessário:** Firestore precisa de índice composto para queries em collection groups com filtros

### Estrutura de Dados

```
/users/{userId}/goals/{goalId}/tasks/{taskId}
                                      ↓
                         Collection group "tasks"
                         (todas as subcoleções tasks)
```

---

## 🔧 Outros Erros Relacionados

### 1. Cross-Origin-Opener-Policy Warning

```
Cross-Origin-Opener-Policy policy would block the window.closed call.
```

**O que é:** Warning do Firebase Auth ao verificar se popup foi fechado.

**Impacto:** Apenas warning, não afeta funcionalidade.

**Solução:** Ignorar ou usar `signInWithRedirect` (já implementado como fallback).

### 2. Message Port Closed

```
Unchecked runtime.lastError: The message port closed before a response was received.
```

**O que é:** Extensão do navegador tentando comunicar.

**Impacto:** Nenhum - relacionado a extensões do navegador.

**Solução:** Ignorar - não é um erro da aplicação.

### 3. Timeout Promise

```
Uncaught (in promise) timeout
```

**O que é:** Relacionado ao popup timeout ou redirect.

**Impacto:** Baixo - geralmente resolvido pelo fallback.

**Solução:** Já implementado - fallback para redirect quando popup falha.

---

## 📝 Checklist

- [x] Identificar query que precisa de índice
- [ ] Criar índice via console Firebase
- [ ] Aguardar índice ser construído (5-10 min)
- [ ] Testar query novamente
- [ ] Verificar que erro desapareceu

---

## 🧪 Como Testar Após Criar Índice

1. **Aguardar índice estar "Enabled"** no Firebase Console

2. **Fazer hard refresh** no navegador (Cmd+Shift+R)

3. **Fazer login** novamente

4. **Verificar console:**
   - Não deve haver erro sobre índice
   - Tasks devem carregar corretamente

5. **Verificar dados:**
   - Goals devem aparecer
   - Tasks devem aparecer
   - Sem erros de permissão

---

## 💡 Dicas

### Verificar Índices Existentes

```bash
# Listar índices
gcloud firestore indexes composite list --project=magnetai-4h4a8

# Ou via Firebase Console
# Firestore Database → Indexes → Composite
```

### Deploy de Índices via CI/CD

Adicionar ao `cloudbuild.yaml`:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['firestore', 'indexes', 'create', '--project=magnetai-4h4a8']
```

### Otimização de Queries

Para evitar índices desnecessários, considere:

1. **Limitar collection groups** - usar paths específicos quando possível
2. **Cache local** - armazenar dados localmente
3. **Batch queries** - reduzir número de queries

---

## 🔗 Links Úteis

- **Criar índice diretamente:** [Link do erro](https://console.firebase.google.com/v1/r/project/magnetai-4h4a8/firestore/indexes?create_exemption=...)
- **Firebase Console:** https://console.firebase.google.com/project/magnetai-4h4a8
- **Firestore Indexes:** https://console.firebase.google.com/project/magnetai-4h4a8/firestore/indexes
- **Documentação:** https://firebase.google.com/docs/firestore/query-data/indexing

---

**Status:** ⏳ Aguardando criação do índice  
**Próxima Ação:** Criar índice via link no erro ou Firebase Console
