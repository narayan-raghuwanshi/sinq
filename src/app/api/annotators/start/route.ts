import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    const annotator = await prisma.annotator.update({
      where: { id: Number(id) },
      data: { start_time: new Date() },
    });

    return NextResponse.json(annotator);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to start timer" },
      { status: 500 }
    );
  }
}
