import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/cloudinary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function uploadBuffer(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const upload = getCloudinary().uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload failed"));
            return;
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      );
      upload.end(buffer);
    },
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are accepted" },
        { status: 415 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Images must be 5 MB or smaller" },
        { status: 413 },
      );
    }

    const folder = String(formData.get("folder") ?? "fixora/products");
    const allowedFolders = new Set([
      "fixora/products",
      "fixora/categories",
      "fixora/brands",
      "fixora/users",
    ]);

    if (!allowedFolders.has(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    const result = await uploadBuffer(Buffer.from(await file.arrayBuffer()), folder);
    return NextResponse.json({ secureUrl: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
