import "server-only";

import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  if (!configured) {
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ??
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Missing server-only Cloudinary configuration: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    configured = true;
  }

  return cloudinary;
}

export async function deleteManagedProductImage(publicId: string): Promise<boolean> {
  const managedPrefix = "fixora/products/";
  if (!publicId.startsWith(managedPrefix) || publicId.length === managedPrefix.length) {
    return false;
  }

  const response: unknown = await getCloudinary().uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (
    response &&
    typeof response === "object" &&
    "result" in response &&
    (response.result === "ok" || response.result === "not found")
  ) {
    return true;
  }

  throw new Error("Cloudinary did not confirm product image deletion.");
}
