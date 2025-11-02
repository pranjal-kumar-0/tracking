import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { progressId } = await request.json();
    if (!progressId) {
      return NextResponse.json({ error: 'progressId is required' }, { status: 400 });
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

    // Delete the task
    await taskDocRef.delete();

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}