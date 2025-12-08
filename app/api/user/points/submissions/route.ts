import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate User
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    // 2. Fetch Submissions for this User
    const submissionsSnap = await dbAdmin
      .collection("quest_submissions")
      .where("userId", "==", uid)
      .get();

    // 3. Transform Data into a simple Map (QuestID -> Status)
    const submissionsMap: Record<string, string> = {};
    
    submissionsSnap.forEach((doc) => {
      const data = doc.data();
      // If a user has multiple submissions for one quest, we prioritize the "best" status
      // Priority: approved > pending > rejected
      const existingStatus = submissionsMap[data.questId];
      const newStatus = data.status;

      if (!existingStatus) {
        submissionsMap[data.questId] = newStatus;
      } else if (newStatus === "approved") {
        submissionsMap[data.questId] = "approved";
      } else if (newStatus === "pending" && existingStatus === "rejected") {
        submissionsMap[data.questId] = "pending";
      }
    });

    return NextResponse.json({ submissions: submissionsMap });

  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}