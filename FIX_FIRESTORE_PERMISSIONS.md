# Correção: Firestore Permissions - Collection Group Tasks

**Data:** 2025-11-12  
**Erro:** Missing or insufficient permissions para collection group "tasks"

---

## 🔍 Problema Identificado

### Erro
```
FirebaseError: Missing or insufficient permissions
method: "list"
path: "/databases/(default)/documents/tasks collection group for user e0R0r8aPhUMfwWyCMRtKVC7FD522"
```

### Causa Raiz

A regra do Firestore está correta:

```javascript
match /{path=**}/tasks/{taskId} {
  allow list: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

**Problema:** As tasks existentes no banco **não têm o campo `userId`**.

A regra verifica `resource.data.userId == request.auth.uid`, mas se o campo não existe, a comparação falha.

---

## ✅ Soluções

### Solução 1: Adicionar userId às Tasks Existentes (Recomendado)

Execute este script no console do Firebase ou crie um script Node.js:

```javascript
// Script para adicionar userId às tasks
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

async function addUserIdToTasks() {
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    console.log(`Processando usuário: ${userId}`);
    
    // Buscar todos os goals do usuário
    const goalsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('goals')
      .get();
    
    for (const goalDoc of goalsSnapshot.docs) {
      const goalId = goalDoc.id;
      console.log(`  Processando goal: ${goalId}`);
      
      // Buscar todas as tasks do goal
      const tasksSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('goals')
        .doc(goalId)
        .collection('tasks')
        .get();
      
      // Atualizar cada task
      const batch = db.batch();
      for (const taskDoc of tasksSnapshot.docs) {
        const taskRef = taskDoc.ref;
        batch.update(taskRef, { userId: userId });
        console.log(`    Atualizando task: ${taskDoc.id}`);
      }
      
      await batch.commit();
      console.log(`  ✅ ${tasksSnapshot.size} tasks atualizadas`);
    }
  }
  
  console.log('✅ Todas as tasks atualizadas com userId');
}

addUserIdToTasks().catch(console.error);
```

### Solução 2: Ajustar Regra (Temporário)

Modificar a regra para não exigir userId:

```javascript
match /{path=**}/tasks/{taskId} {
  // Permitir se autenticado E (userId existe e é do usuário OU userId não existe)
  allow list: if request.auth != null && 
    (!('userId' in resource.data) || resource.data.userId == request.auth.uid);
  allow get: if request.auth != null && 
    (!('userId' in resource.data) || resource.data.userId == request.auth.uid);
}
```

**Nota:** Esta solução é menos segura. Use apenas temporariamente.

---

## 🚀 Solução Rápida (Via Console Firebase)

### Passo 1: Acessar Firestore

https://console.firebase.google.com/project/magnetai-4h4a8/firestore/data

### Passo 2: Para Cada Task

1. Navegar até: `users/{userId}/goals/{goalId}/tasks/{taskId}`
2. Clicar em "Edit document"
3. Adicionar campo:
   - **Field:** `userId`
   - **Type:** string
   - **Value:** (copiar o userId do path)
4. Salvar

Repetir para todas as tasks.

---

## 🔧 Solução Automática (Script)

Crie arquivo `fix-tasks-userid.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixTasks() {
  try {
    // Buscar todos os usuários
    const usersSnapshot = await db.collection('users').get();
    let totalTasks = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Buscar goals do usuário
      const goalsSnapshot = await db
        .collection(`users/${userId}/goals`)
        .get();
      
      for (const goalDoc of goalsSnapshot.docs) {
        const goalId = goalDoc.id;
        
        // Buscar tasks do goal
        const tasksSnapshot = await db
          .collection(`users/${userId}/goals/${goalId}/tasks`)
          .get();
        
        // Atualizar em batch
        if (tasksSnapshot.size > 0) {
          const batch = db.batch();
          
          tasksSnapshot.docs.forEach(taskDoc => {
            const taskData = taskDoc.data();
            if (!taskData.userId) {
              batch.update(taskDoc.ref, { userId: userId });
              totalTasks++;
            }
          });
          
          await batch.commit();
        }
      }
    }
    
    console.log(`✅ ${totalTasks} tasks atualizadas com userId`);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixTasks();
```

Execute:
```bash
node fix-tasks-userid.js
```

---

## 📋 Verificar Após Correção

### Teste 1: Query Manual

No console do Firebase, execute:

```javascript
db.collectionGroup('tasks')
  .where('userId', '==', 'e0R0r8aPhUMfwWyCMRtKVC7FD522')
  .get()
```

Deve retornar as tasks sem erro.

### Teste 2: Na Aplicação

1. Fazer login
2. Verificar se goals carregam
3. Verificar se tasks carregam
4. Não deve haver erro de permissão

---

## 🎯 Resumo

### Problema
- ✅ Regras do Firestore corretas
- ❌ Tasks não têm campo `userId`
- ❌ Query collectionGroup falha

### Solução
1. Adicionar campo `userId` em todas as tasks existentes
2. Garantir que novas tasks sempre incluam `userId`

### Código da Aplicação

Verificar que ao criar task, o userId é incluído:

```typescript
const newTask = {
  id: taskId,
  goalId: goalId,
  title: title,
  userId: user.uid,  // ✅ Deve estar presente
  // ... outros campos
};
```

---

**Status:** ⚠️ Requer ação manual  
**Próxima Ação:** Adicionar userId às tasks existentes via script ou console
