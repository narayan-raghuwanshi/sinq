import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const annotators = await prisma.annotator.findMany();
    return NextResponse.json(annotators);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch annotators" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    const annotator = await prisma.annotator.create({
      data: { name },
    });
    return NextResponse.json(annotator);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to create annotator" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await prisma.annotator.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete annotator" },
      { status: 500 }
    );
  }
}
