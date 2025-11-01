import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin"; 
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value || "";
    const decodedToken = await authAdmin.verifySessionCookie(sessionCookie, true);
    const uid = decodedToken.uid;

    const userDoc = await dbAdmin.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return NextResponse.json({ role: "member" });
    }

    const role = userDoc.data()?.role;

    return NextResponse.json({ role: role || "member" });

  } catch (error) {
    return NextResponse.json({ role: "none" }, { status: 401 });
  }
}