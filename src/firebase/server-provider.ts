
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// CORREÇÃO: Valida a existência das variáveis de ambiente antes de usá-las.
// Isso evita que o aplicativo trave em tempo de execução se as variáveis não estiverem definidas.
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL
) {
  throw new Error(
    'As variáveis de ambiente do Firebase (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) não estão configuradas corretamente.'
  );
}

// A asserção de tipo é segura agora por causa da verificação acima.
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replaceAll(/\\n/g, '\n'), 
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
