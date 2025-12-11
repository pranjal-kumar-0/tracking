import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate User
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    // 2. Parse & Validate Data
    const body = await request.json();
    const { questId, questTitle, points, repoLink, track, clubId } = body;

    if (!questId || !repoLink || !clubId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    //Optional: Check if user already submitted this specific quest
    const existing = await dbAdmin.collection("quest_submissions")
      .where("userId", "==", uid)
      .where("questId", "==", questId)
      .get();
    if (!existing.empty) {
       return NextResponse.json({ error: "You have already submitted this quest." }, { status: 409 });
    }

    //3. Store Submission in Firestore
    const submissionData = {
      userId: uid,
      clubId,
      questId,
      questTitle,
      track: track || "general",
      points: Number(points),
      repoLink,
      status: "pending", // pending | approved | rejected
      submittedAt: admin.firestore.Timestamp.now(),
      reviewedBy: null,
      reviewedAt: null,
    };

    await dbAdmin.collection("quest_submissions").add(submissionData);

    return NextResponse.json({ 
      message: "Submission received. Pending approval.", 
      success: true 
    });

  } catch (error: any) {
    console.error("Error submitting quest:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}