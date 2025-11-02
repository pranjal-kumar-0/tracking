import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { clubId, userId, createdAt, description, dueDate, title } = await request.json();
    if (!clubId || !userId || !createdAt || !description || !dueDate || !title) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const clubDocRef = dbAdmin.collection('clubs').doc(clubId);
    const clubDocSnap = await clubDocRef.get();
    if (!clubDocSnap.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    const clubData = clubDocSnap.data();
    const adminIds = clubData?.adminIds || [];
    if (!adminIds.includes(decodedToken.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // if user exists
    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add task
    await dbAdmin.collection('progress').add({
      clubId,
      userId,
      createdAt,
      description,
      dueDate,
      givenBy: 'club',
      status: 0,
      title
    });

    return NextResponse.json({ message: 'Task assigned successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error assigning task:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}