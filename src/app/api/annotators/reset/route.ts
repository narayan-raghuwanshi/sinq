// app/api/annotators/reset/route.ts (Prisma version)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    const annotator = await prisma.annotator.update({
      where: { id: Number(id) },
      data: { start_time: null },
    });

    return NextResponse.json(annotator);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to reset timer" },
      { status: 500 }
    );
  }
}
