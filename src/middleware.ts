
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/firebase/server-provider';
import { getFirestore } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

async function handleSuspiciousIp(userId: string, currentIp: string | undefined): Promise<void> {
  if (!currentIp) {
    return;
  }

  const db = getFirestore();
  const userRef = db.collection('user_metadata').doc(userId);

  try {
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({ lastIp: currentIp });
      return;
    }

    const lastIp = userDoc.data()?.lastIp;

    if (lastIp && lastIp !== currentIp) {
      console.warn(`[Security] Mudança de IP suspeita para o usuário ${userId}. Revogando tokens.`);
      await auth.revokeRefreshTokens(userId);
    }
  } catch (error) {
    console.error(`[Security] Erro ao verificar IP do usuário ${userId}:`, error);
  }
}

export async function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const token = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!token) {
    const response = new NextResponse(JSON.stringify({ error: 'Token não fornecido.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const clientIp = request.ip;

    await handleSuspiciousIp(userId, clientIp);
    
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    
    response.headers.set('Access-Control-Allow-Origin', '*');

    return response;

  } catch (error: any) {
    console.error("[Auth Error]", { code: error.code, message: error.message });

    let errorMessage = 'Token de autenticação inválido.';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.';
    }

    const errorResponse = new NextResponse(JSON.stringify({ error: errorMessage }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}

export const config = {
  matcher: '/api/((?!auth/login).*)',
};
