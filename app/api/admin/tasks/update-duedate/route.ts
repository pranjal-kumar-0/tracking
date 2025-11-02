import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { progressId, newDueDate } = await request.json();
    if (!progressId || !newDueDate) {
      return NextResponse.json({ error: 'progressId and newDueDate are required' }, { status: 400 });
    }

    // Get the task document
    const taskDocRef = dbAdmin.collection('progress').doc(progressId);
    const taskDocSnap = await taskDocRef.get();
    if (!taskDocSnap.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const taskData = taskDocSnap.data();

    // Check if the user is admin of the club
    const clubDocRef = dbAdmin.collection('clubs').doc(taskData?.clubId);
    const clubDocSnap = await clubDocRef.get();
    if (!clubDocSnap.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    const clubData = clubDocSnap.data();
    const adminIds = clubData?.adminIds || [];
    if (!adminIds.includes(decodedToken.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Update due date
    await taskDocRef.update({ dueDate: newDueDate });

    return NextResponse.json({ message: 'Due date updated successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error updating due date:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}