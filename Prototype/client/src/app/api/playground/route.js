import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      modelUsed,
      attackUsed,
      originalPrediction,
      originalConfidence,
      adversarialPrediction,
      adversarialConfidence,
      originalImage,
      adversarialImage,
      heatmapImage,
    } = body;
    console.log(body);

    const result = await prisma.analysisResult.create({
      data: {
        modelUsed,
        attackUsed,
        originalPrediction,
        originalConfidence,
        adversarialPrediction,
        adversarialConfidence,
        originalImage,
        adversarialImage,
        heatmapImage,
        userId: user.id,
      },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving analysis result:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await prisma.analysisResult.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching analysis results:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
