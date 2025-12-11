import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const { clubId, userId } = await request.json();

    if (!clubId) {
      return NextResponse.json({ error: "clubId required" }, { status: 400 });
    }

    // Verify admin
    const clubDoc = await dbAdmin.collection("clubs").doc(clubId).get();
    if (!clubDoc.exists) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const clubData = clubDoc.data();
    if (!clubData?.adminIds?.includes(decodedToken.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query
    let query = dbAdmin.collection("quest_submissions").where("clubId", "==", clubId);
    if (userId) query = query.where("userId", "==", userId);

    const snapshot = await query.get();
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (b.submittedAt?._seconds || 0) - (a.submittedAt?._seconds || 0));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
