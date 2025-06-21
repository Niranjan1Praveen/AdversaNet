import { NextResponse } from "next/server";
import prisma from "@/app/utils/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validExtensions = [".pt", ".onnx", ".pkl", ".h5"];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", "models");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const uniqueFilename = `${kindeUser.id}_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.promises.writeFile(filePath, buffer);

    const fileData = Buffer.from(buffer);

    const model = await prisma.customModel.create({
      data: {
        userId: kindeUser.id,
        name: file.name,
        fileName: uniqueFilename,
        fileType: file.type,
        fileSize: file.size,
        filePath: filePath,
        fileData: fileData,
        description: description || null,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    console.error("Error uploading model:", error);
    return NextResponse.json(
      { error: "Failed to upload model" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const models = await prisma.customModel.findMany({
      where: {
        userId: kindeUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    const model = await prisma.customModel.findUnique({
      where: {
        id,
        userId: kindeUser.id,
      },
    });

    if (!model) {
      return NextResponse.json(
        { error: "Model not found or not owned by user" },
        { status: 404 }
      );
    }

    try {
      await fs.promises.unlink(model.filePath);
    } catch (fileError) {
      console.error("Error deleting model file:", fileError);
    }

    // Delete model from database
    await prisma.customModel.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: "Model deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { error: "Failed to delete model" },
      { status: 500 }
    );
  }
}
