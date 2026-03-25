import { put } from "@vercel/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const MAX_BYTES = 95 * 1024 * 1024; // ~95MB; tune for your blob provider

async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return jar.get("dp_admin")?.value === "1";
}

/**
 * POST multipart/form-data with field `file`.
 * Returns `{ url }` for a public blob URL — admin panel writes it to the target field.
 * Requires `BLOB_READ_WRITE_TOKEN` (Vercel Blob). Swap implementation if you use S3/R2.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Blob uploads not configured. Set BLOB_READ_WRITE_TOKEN or paste a URL from your storage console.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const name =
    file instanceof File && file.name
      ? file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      : `upload-${Date.now()}`;

  try {
    const blob = await put(name, file, {
      access: "public",
      token,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("[admin/upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
