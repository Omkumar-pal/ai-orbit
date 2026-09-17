import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "aiorbit-backend",
    endpoints: {
      tools: "/api/v1/tools?page=1&pageSize=24&q&category&pricing&sort",
    },
  });
}
