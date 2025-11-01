import { authAdmin } from "@/lib/firebaseAdmin";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";


export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });

    (await
          cookies()).set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn,
      path: "/", 
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Session login error:", error);
    return NextResponse.json({ status: "error" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    (await
          cookies()).set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, 
      path: "/",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Session logout error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}