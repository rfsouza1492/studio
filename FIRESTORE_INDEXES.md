# Firestore Indexes Configuration

Este documento explica os índices do Firestore configurados para este projeto.

## Índices Atuais

### Collection Group: `tasks` (userId)

**Status:** ✅ Configurado em `firestore.indexes.json` e criado no Firestore

**Configuração atual (`firestore.indexes.json`):**
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

**Query que usa este índice:**
```typescript
query(collectionGroup(firestore, 'tasks'), where('userId', '==', user.uid))
```

**Localização no código:**
- `studio/src/context/GoalContext.tsx` (linha 145)

**Descrição:**
Este índice permite consultas em collection group para buscar todas as tarefas de um usuário específico, independentemente de em qual goal elas estão aninhadas.

**Nota Importante:**
Embora o Firestore possa criar automaticamente índices de campo único para queries de collection group, é uma boa prática declarar explicitamente no arquivo `firestore.indexes.json` para:
- Garantir que o índice seja criado antes da primeira query
- Documentar claramente quais índices são necessários
- Facilitar o deploy e versionamento dos índices
- Evitar erros durante o desenvolvimento

## Quando Adicionar Novos Índices

### Collection Group Queries com Campo Único
Embora o Firestore possa criar automaticamente índices de campo único para queries de collection group, **recomendamos adicionar ao `firestore.indexes.json`** para garantir consistência e documentação.

**Exemplo (recomendado adicionar ao `firestore.indexes.json`):**
```typescript
query(collectionGroup(firestore, 'tasks'), where('userId', '==', user.uid))
```

**Configuração correspondente:**
```json
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
```

**Nota:** Adicionar índices de campo único ao arquivo é uma boa prática, mesmo que o Firestore possa criá-los automaticamente. Isso garante que o índice exista antes da primeira query e documenta claramente as dependências do projeto.

### Queries com `orderBy`
Se você adicionar `orderBy()` a uma query existente, pode ser necessário um índice composto.

**Exemplo que requer índice composto:**
```typescript
query(
  collectionGroup(firestore, 'tasks'),
  where('userId', '==', user.uid),
  orderBy('deadline', 'asc')
)
```

Este exemplo requereria um índice com:
- `userId` (ASCENDING)
- `deadline` (ASCENDING)

### Múltiplos `where` com `orderBy`
Queries com múltiplos `where` e `orderBy` sempre requerem índices compostos.

**Exemplo:**
```typescript
query(
  collectionGroup(firestore, 'tasks'),
  where('userId', '==', user.uid),
  where('completed', '==', false),
  orderBy('deadline', 'asc')
)
```

## Como Adicionar um Novo Índice

1. **Edite `firestore.indexes.json`:**
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
        },
        {
          "fieldPath": "deadline",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

2. **Deploy os índices:**
```bash
firebase deploy --only firestore:indexes
```

3. **Aguarde a criação:**
   - Índices podem levar alguns minutos para serem criados
   - Você receberá um link no console se o índice ainda não existir
   - O Firebase criará automaticamente quando você executar a query pela primeira vez

## Verificação de Índices

Para verificar se todos os índices necessários estão criados:

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá para Firestore Database > Indexes
3. Verifique se todos os índices listados em `firestore.indexes.json` estão criados e ativos

## Troubleshooting

### Erro: "The query requires a COLLECTION_GROUP_ASC index"

**Causa:** Você está usando uma query de collection group que requer um índice que ainda não foi criado.

**Solução:**
1. Adicione o índice necessário em `firestore.indexes.json`
2. Faça deploy: `firebase deploy --only firestore:indexes`
3. Aguarde alguns minutos para o índice ser criado
4. Ou clique no link fornecido no erro para criar o índice diretamente no console

### Erro: "Index is building"

**Causa:** O índice foi criado mas ainda está sendo construído.

**Solução:** Aguarde alguns minutos e tente novamente. Índices grandes podem levar até 1 hora para serem construídos.

## Referências

- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Collection Group Queries](https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query)

