import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { progressId, status } = await request.json();
    if (!progressId || status === undefined || status < 0 || status > 100) {
      return NextResponse.json({ error: 'progressId and valid status (0-100) are required' }, { status: 400 });
    }

    const progressDocRef = dbAdmin.collection('progress').doc(progressId);
    const progressDocSnap = await progressDocRef.get();
    if (!progressDocSnap.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const progressData = progressDocSnap.data();
    if (progressData?.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own tasks' }, { status: 403 });
    }

    // Update status
    await progressDocRef.update({ status });

    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}