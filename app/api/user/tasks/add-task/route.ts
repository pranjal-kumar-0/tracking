import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { userId, clubId, createdAt, description, dueDate, givenBy, status, title } = await request.json();
    if (!userId || !clubId || !createdAt || !description || !dueDate || !givenBy || status === undefined || !title) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Ensure the user can only add tasks for themselves
    if (userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only add tasks for yourself' }, { status: 403 });
    }

    if (givenBy === "club") {
      const clubDocRef = dbAdmin.collection('clubs').doc(clubId);
      const clubDocSnap = await clubDocRef.get();
      if (!clubDocSnap.exists) {
        return NextResponse.json({ error: 'Club not found' }, { status: 404 });
      }
      const clubData = clubDocSnap.data();
      const memberIds = clubData?.memberIds || [];
      if (!memberIds.includes(userId)) {
        return NextResponse.json({ error: 'Forbidden: You are not a member of this club' }, { status: 403 });
      }
    }

    // Add task
    await dbAdmin.collection('progress').add({
      clubId,
      userId,
      createdAt,
      description,
      dueDate,
      givenBy,
      status,
      title
    });

    return NextResponse.json({ message: 'Task added successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}