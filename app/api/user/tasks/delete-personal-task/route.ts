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

    const progressDocRef = dbAdmin.collection('progress').doc(progressId);
    const progressDocSnap = await progressDocRef.get();
    if (!progressDocSnap.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const progressData = progressDocSnap.data();
    if (progressData?.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own tasks' }, { status: 403 });
    }

    if (progressData?.givenBy !== "personal") {
      return NextResponse.json({ error: 'Forbidden: Only personal tasks can be deleted by users' }, { status: 403 });
    }

    // Delete the task
    await progressDocRef.delete();

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}