"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateCategoryImageAction } from "@/app/admin/actions";

export function CategoryImageUploader({ categoryId }: { categoryId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <div className="flex items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-slate-700"><Upload className="size-4" /> {busy ? "Uploading…" : "Upload image"}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.currentTarget.value = ""; if (!file) return; void (async () => { setBusy(true); setError(""); try { const form = new FormData(); form.set("file", file); form.set("folder", "fixora/categories"); const response = await fetch("/api/uploads/image", { method: "POST", body: form }); const result = await response.json() as { secureUrl?: string; error?: string }; if (!response.ok || !result.secureUrl) throw new Error(result.error ?? "Upload failed."); await updateCategoryImageAction(categoryId, result.secureUrl); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); } finally { setBusy(false); } })(); }} /></label>{error && <span className="text-xs text-red-700">{error}</span>}</div>;
}
