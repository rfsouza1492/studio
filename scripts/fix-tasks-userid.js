#!/usr/bin/env node
/**
 * Script para adicionar userId às tasks existentes no Firestore
 * 
 * Este script percorre todas as tasks e adiciona o campo userId
 * baseado no path do documento (users/{userId}/goals/{goalId}/tasks/{taskId})
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp({
  projectId: 'magnetai-4h4a8'
});

const db = admin.firestore();

async function addUserIdToTasks() {
  console.log('🔍 Iniciando correção de userId nas tasks...\n');
  
  let totalUsers = 0;
  let totalGoals = 0;
  let totalTasks = 0;
  let tasksUpdated = 0;
  
  try {
    // Buscar todos os usuários
    const usersSnapshot = await db.collection('users').get();
    totalUsers = usersSnapshot.size;
    console.log(`📊 Encontrados ${totalUsers} usuários\n`);
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      console.log(`👤 Processando usuário: ${userId}`);
      
      // Buscar todos os goals do usuário
      const goalsSnapshot = await db
        .collection('users')
        .doc(userId)
        .collection('goals')
        .get();
      
      totalGoals += goalsSnapshot.size;
      console.log(`  📁 ${goalsSnapshot.size} goals encontrados`);
      
      for (const goalDoc of goalsSnapshot.docs) {
        const goalId = goalDoc.id;
        
        // Buscar todas as tasks do goal
        const tasksSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('goals')
          .doc(goalId)
          .collection('tasks')
          .get();
        
        if (tasksSnapshot.size === 0) continue;
        
        totalTasks += tasksSnapshot.size;
        console.log(`    📝 ${tasksSnapshot.size} tasks no goal ${goalId}`);
        
        // Atualizar tasks em batch
        const batch = db.batch();
        let batchCount = 0;
        
        for (const taskDoc of tasksSnapshot.docs) {
          const taskData = taskDoc.data();
          
          // Verificar se userId já existe
          if (!taskData.userId) {
            batch.update(taskDoc.ref, { userId: userId });
            batchCount++;
            tasksUpdated++;
          }
        }
        
        if (batchCount > 0) {
          await batch.commit();
          console.log(`    ✅ ${batchCount} tasks atualizadas`);
        } else {
          console.log(`    ℹ️  Todas as tasks já têm userId`);
        }
      }
      
      console.log('');
    }
    
    // Resumo final
    console.log('═'.repeat(60));
    console.log('✅ CORREÇÃO CONCLUÍDA');
    console.log('═'.repeat(60));
    console.log(`👥 Usuários processados: ${totalUsers}`);
    console.log(`📁 Goals processados: ${totalGoals}`);
    console.log(`📝 Tasks encontradas: ${totalTasks}`);
    console.log(`✏️  Tasks atualizadas: ${tasksUpdated}`);
    console.log('═'.repeat(60));
    
    if (tasksUpdated === 0) {
      console.log('\nℹ️  Nenhuma task precisou ser atualizada.');
      console.log('   Todas as tasks já possuem o campo userId.');
    } else {
      console.log('\n✅ Todas as tasks agora têm o campo userId!');
      console.log('   A query collectionGroup deve funcionar corretamente.');
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao processar tasks:', error);
    process.exit(1);
  }
}

// Executar
console.log('🚀 Script de Correção de Tasks - userId\n');
addUserIdToTasks()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });

