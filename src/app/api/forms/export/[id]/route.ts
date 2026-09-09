import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api";

const API_URL = API_BASE_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") || "xlsx";

  // Forward cookies from the browser to the backend
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const backendRes = await fetch(
      `${API_URL}/api/forms/export/${id}?format=${format}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json(
        { message: errText || "Export failed" },
        { status: backendRes.status }
      );
    }

    // Stream the response body through
    const contentType =
      backendRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
      backendRes.headers.get("content-disposition") || "";

    const body = await backendRes.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Export proxy error:", err);
    return NextResponse.json(
      { message: "Failed to export" },
      { status: 500 }
    );
  }
}
