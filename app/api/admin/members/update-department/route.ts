import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { userId, clubId, department } = await request.json();
    if (!userId || !clubId || !department) {
      return NextResponse.json({ error: 'userId, clubId, and department are required' }, { status: 400 });
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

    // Fetch user data
    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDocSnap.data();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubIds = (userData?.clubIds as any[]) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedClubIds = clubIds.map((c: any) =>
      c.clubId === clubId ? { ...c, department } : c
    );

    await userDocRef.update({ clubIds: updatedClubIds });

    return NextResponse.json({ message: 'Department updated successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}