import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);

    const { clubId, userId } = await request.json();
    if (!clubId || !userId) {
      return NextResponse.json({ error: 'clubId and userId are required' }, { status: 400 });
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

    // Get user data
    const userDocRef = dbAdmin.collection('users').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (!userDocSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDocSnap.data();
    const email = userData?.email;

    // Remove from user's clubIds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clubIds = (userData?.clubIds as any[]) || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedClubIds = clubIds.filter((c: any) => c.clubId !== clubId);
    await userDocRef.update({ clubIds: updatedClubIds });

    // Remove club's adminIds 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedAdminIds = adminIds.filter((id: any) => id !== email);
    await clubDocRef.update({ adminIds: updatedAdminIds });

    // Remove progress documents
    const progressQuery = await dbAdmin.collection('progress')
      .where('userId', '==', userId)
      .where('clubId', '==', clubId)
      .get();
    const deletePromises = progressQuery.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return NextResponse.json({ message: 'Member removed successfully' }, { status: 200 });

  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}