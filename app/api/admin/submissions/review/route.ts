import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const { submissionId, action, clubId } = await request.json();

    if (!submissionId || !action || !clubId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify admin
    const clubDoc = await dbAdmin.collection("clubs").doc(clubId).get();
    if (!clubDoc.exists || !clubDoc.data()?.adminIds?.includes(decodedToken.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submissionRef = dbAdmin.collection("quest_submissions").doc(submissionId);
    const submissionSnap = await submissionRef.get();
    
    if (!submissionSnap.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submissionData = submissionSnap.data();
    const prevStatus = submissionData?.status;
    
    await submissionRef.update({
      status: action,
      reviewedBy: decodedToken.uid,
      reviewedAt: admin.firestore.Timestamp.now(),
    });

    const userRef = dbAdmin.collection("users").doc(submissionData?.userId);
    const pts = submissionData?.points || 0;

    // Add points if approving
    if (action === "approved" && prevStatus !== "approved") {
      await userRef.update({ points: admin.firestore.FieldValue.increment(pts) });
    }
    // Deduct points if rejecting previously approved submission
    if (action === "rejected" && prevStatus === "approved") {
      await userRef.update({ points: admin.firestore.FieldValue.increment(-pts) });
    }

    return NextResponse.json({ message: `Submission ${action}` });
  } catch (error) {
    console.error("Error reviewing submission:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
