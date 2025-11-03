import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    const userDoc = await dbAdmin.collection("users").doc(uid).get();

    if (!userDoc.exists || userDoc.data()?.role !== "super_admin") {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, name, departments, adminIds, memberIds } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const clubRef = dbAdmin.collection('clubs').doc(id);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const currentClubData = clubDoc.data();
    const currentAdminIds = currentClubData?.adminIds || [];
    const currentMemberIds = currentClubData?.memberIds || [];

    const updateData: Partial<{name: string; departments: string[]; adminIds: string[]; memberIds: string[]}> = {};
    if (name !== undefined) updateData.name = name;
    if (departments !== undefined) updateData.departments = departments;
    if (adminIds !== undefined) updateData.adminIds = adminIds;
    if (memberIds !== undefined) updateData.memberIds = memberIds;

    if (adminIds !== undefined) {
      const adminUserIds: string[] = [];
      for (const email of adminIds) {
        const userQuery = await dbAdmin.collection('users').where('email', '==', email).get();
        if (!userQuery.empty) {
          adminUserIds.push(userQuery.docs[0].id);
        }
      }
      const newMemberIds = memberIds ? [...new Set([...memberIds, ...adminUserIds])] : adminUserIds;
      updateData.memberIds = newMemberIds;
    }

    // Update adminIds in users
    if (adminIds !== undefined) {
      const removedAdmins = currentAdminIds.filter((email: string) => !adminIds.includes(email));

      for (const email of adminIds) {
        const userQuery = await dbAdmin.collection('users').where('email', '==', email).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const userData = userDoc.data();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clubIds = (userData?.clubIds as any[]) || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const existingIndex = clubIds.findIndex((c: any) => c.clubId === id);
          if (existingIndex === -1) {
            clubIds.push({ clubId: id, department: 'no-department' });
          } else {
            clubIds[existingIndex] = { clubId: id, department: 'no-department' };
          }
          await userDoc.ref.update({ clubIds });
        }
      }

      for (const email of removedAdmins) {
        const userQuery = await dbAdmin.collection('users').where('email', '==', email).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const userData = userDoc.data();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clubIds = (userData?.clubIds as any[]) || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updatedClubIds = clubIds.filter((c: any) => c.clubId !== id);
          await userDoc.ref.update({ clubIds: updatedClubIds });
        }
      }
    }

    // Update memberIds in users
    if (memberIds !== undefined) {
      const newMembers = memberIds.filter((userId: string) => !currentMemberIds.includes(userId));
      const removedMembers = currentMemberIds.filter((userId: string) => !memberIds.includes(userId));

      for (const userId of newMembers) {
        const userDoc = await dbAdmin.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clubIds = (userData?.clubIds as any[]) || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (!clubIds.some((c: any) => c.clubId === id)) {
            clubIds.push({ clubId: id, department: 'no-department' });
            await userDoc.ref.update({ clubIds });
          }
        }
      }

      for (const userId of removedMembers) {
        const userDoc = await dbAdmin.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clubIds = (userData?.clubIds as any[]) || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updatedClubIds = clubIds.filter((c: any) => c.clubId !== id);
          await userDoc.ref.update({ clubIds: updatedClubIds });
        }
      }
    }

    await clubRef.update(updateData);

    return NextResponse.json({ message: 'Club updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 });
  }
}