import { NextResponse } from "next/server";
import { loadFxBlueWidgets } from "@/lib/fxblue/load-widgets";

export const runtime = "nodejs";

/**
 * Public JSON derived from the same HTML widget pages as the official iframes.
 * Cached at the edge via Cache-Control; FX Blue is fetched with revalidate: 120.
 */
export async function GET() {
  try {
    const payload = await loadFxBlueWidgets();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    console.error("[api/fxblue/data]", e);
    return NextResponse.json(
      {
        publisherId: "",
        profileUrl: "",
        updatedAt: new Date().toISOString(),
        verify: { account: "", monthly: "", cumulative: "" },
        account: null,
        monthly: null,
        cumulative: null,
        customUi: false,
        errors: ["server"],
      },
      { status: 500 },
    );
  }
}
