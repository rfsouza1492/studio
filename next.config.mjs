
/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORREÇÃO: Expõe as variáveis de ambiente do servidor para o ambiente Node.js do Next.js.
  // Isso garante que o Firebase Admin SDK (usado no middleware) possa se autenticar corretamente.
  env: {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  },
};

export default nextConfig;
