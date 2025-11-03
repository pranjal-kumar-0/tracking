import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDocRef = dbAdmin.collection('users').doc(uid);
    const userDocSnap = await userDocRef.get();

    let userData = userDocSnap.data();
    if (!userDocSnap.exists || !userData) {
      userData = {
        email: decodedToken.email,
        name: decodedToken.name,
        photoURL: decodedToken.picture,
        role: 'member',
        clubIds: [],
        createdAt: new Date(),
      };
      await userDocRef.set(userData);
    } else if (!userData.role) {
      await userDocRef.update({ role: 'member' });
      userData.role = 'member';
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ message: 'Session created', role: userData.role });
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}