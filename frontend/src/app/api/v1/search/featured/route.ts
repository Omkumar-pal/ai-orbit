import { NextRequest, NextResponse } from "next/server";

// Own backend route — mirrors live workers.dev shape.
// Later: replace demo with prisma.<model>.findMany() per aiorbit_schema.sql
// Live reference: https://ai-orbit.palamrendra-pm.workers.dev/api/v1/search/featured

export async function GET(req: NextRequest) {
  const demo = {"featured":[{"id":"4917ab0f-e669-4333-9af3-d6ba29daf384","type":"tool","title":"AnswerThis","slug":"answerthis","category":"Tool","logoUrl":"https://framerusercontent.com/images/9om4LSSLApE0ddezUHEbZcM7PfI.png"},{"id":"fd198d3c-5cee-415f-9153-db32c369a325","type":"tool","title":"AnyClip","slug":"anyclip","category":"Tool","logoUrl":"https://anyclip.com/wp-content/uploads/2022/04/cropped-anyclip-favicon-180x180.png"},{"id":"4e0492b6-511c-4bfd-a833-a10e344b4b9a","type":"tool","title":"Aqua Voice","slug":"aqua-voice","category":"Tool","logoUrl":"https://aquavoice.com/images/icons/apple-touch-icon.png"},{"id":"43cdbca9-ffd4-4ad2-93d8-0bac18eb1601","type":"tool","title":"ARTSMART AI","slug":"artsmart-ai","category":"Tool","logoUrl":"https://artsmart.ai/wp-content/uploads/2023/07/cropped-favicon-180x180.png"},{"id":"cfbdf2d9-cdf8-42a9-a054-663db8ac6745","type":"tool","title":"Atlas","slug":"atlas","category":"Tool","logoUrl":"https://www.atlas.org/images/apple-touch-icon.png"},{"id":"dc4cd873-907e-4f6f-b014-929ddbd622d6","type":"tool","title":"Anime AI","slug":"anime-ai","category":"Tool","logoUrl":"https://animeai.app/images/app-icons/logo-192.png"}]};
  // TODO: wire Prisma — e.g., prisma.company.findMany({ skip, take, where })
  // For now return shape-compatible demo + pagination echo
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 24);
  return NextResponse.json({ ...demo, page, pageSize }, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
