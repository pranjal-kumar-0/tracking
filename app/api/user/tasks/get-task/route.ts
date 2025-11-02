import { dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const userId = searchParams.get('userId');

    if (!clubId || !userId) {
      return NextResponse.json({ error: 'clubId and userId are required' }, { status: 400 });
    }

    const progressQuery = await dbAdmin.collection('progress')
      .where('clubId', '==', clubId)
      .where('userId', '==', userId)
      .get();

    const tasks = progressQuery.docs.map(doc => ({
      progressId: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(tasks, { status: 200 });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}