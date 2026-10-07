"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  addProductImageAction,
  moveProductImageAction,
  removeProductImageAction,
  setPrimaryProductImageAction,
} from "@/app/admin/actions";
import type { ProductImage } from "@/lib/types/marketplace";

export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const orderedImages = [...images].sort(
    (first, second) =>
      first.sort_order - second.sort_order ||
      first.created_at.localeCompare(second.created_at),
  );

  async function upload(file: File) {
    setError("");
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", "fixora/products");
      const response = await fetch("/api/uploads/image", { method: "POST", body });
      const result = (await response.json()) as {
        error?: string;
        secureUrl?: string;
        publicId?: string;
      };
      if (!response.ok || !result.secureUrl || !result.publicId) {
        throw new Error(result.error ?? "Upload failed.");
      }
      await addProductImageAction(productId, {
        image_url: result.secureUrl,
        public_id: result.publicId,
        alt_text: file.name,
      });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function manageImage(action: () => Promise<unknown>) {
    setError("");
    setBusy(true);
    try {
      await action();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update image.");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(imageId: string) {
    if (!confirm("Remove this product image?")) return;
    setError("");
    setBusy(true);
    try {
      const result = await removeProductImageAction(productId, imageId);
      router.refresh();
      if (!result.assetCleanup) {
        setError("Image record removed, but its Cloudinary asset could not be confirmed for deletion.");
      }
    } catch (cause) {
      router.refresh();
      setError(cause instanceof Error ? cause.message : "Unable to remove image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Upload image
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void upload(file);
          }}
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {orderedImages.length === 0 ? (
        <p className="text-sm text-slate-500">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {orderedImages.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="relative aspect-square bg-slate-100">
                <Image
                  src={image.image_url}
                  alt={image.alt_text ?? "Product image"}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <button
                  type="button"
                  aria-label={`Move image ${index + 1} up`}
                  disabled={busy || index === 0}
                  onClick={() => void manageImage(() =>
                    moveProductImageAction(productId, image.id, "up"),
                  )}
                  className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={image.is_primary ? "Primary image" : "Set as primary image"}
                  disabled={busy || image.is_primary}
                  onClick={() => void manageImage(() =>
                    setPrimaryProductImageAction(productId, image.id),
                  )}
                  className="rounded p-1 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                >
                  <Star className={`size-4 ${image.is_primary ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  aria-label={`Move image ${index + 1} down`}
                  disabled={busy || index === orderedImages.length - 1}
                  onClick={() => void manageImage(() =>
                    moveProductImageAction(productId, image.id, "down"),
                  )}
                  className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Remove image"
                  disabled={busy}
                  onClick={() => void removeImage(image.id)}
                  className="rounded p-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
