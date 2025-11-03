import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clubId = searchParams.get('clubId');

    if (!userId || !clubId) {
      return NextResponse.json({ error: 'userId and clubId are required' }, { status: 400 });
    }

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

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

    // Fetch user data
    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDocSnap.data();
    const email = userData?.email;
    const name = userData?.name;
    const photoURL = userData?.photoURL || null;

    // Find department for the club
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubIds = (userData?.clubIds as any[]) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubEntry = clubIds.find((c: any) => c.clubId === clubId);
    const department = clubEntry ? clubEntry.department : null;

    const role = adminIds.includes(email) ? 'admin' : 'member';

    // Fetch progress data
    const progressSnapshot = await dbAdmin.collection('progress')
      .where('userId', '==', userId)
      .where('clubId', '==', clubId)
      .get();
    const progress = progressSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        progressId: doc.id,
        createdAt: data.createdAt,
        description: data.description,
        dueDate: data.dueDate,
        givenBy: data.givenBy,
        status: data.status,
        title: data.title
      };
    });

    return NextResponse.json({
      email,
      name,
      photoURL,
      department,
      role,
      progress,
      departments: clubData?.departments || []
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching member info:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}