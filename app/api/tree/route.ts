import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

let TREE_CACHE: any = null;

export async function GET(req: NextRequest) {
  if (!TREE_CACHE) {
    const filePath = path.join(process.cwd(), "data/level_one.json");
    const file = fs.readFileSync(filePath, "utf8");
    TREE_CACHE = JSON.parse(file);
    console.log("Loaded tree.json once at startup");
  }

  const filter = req.nextUrl.searchParams.get("filter")?.toLowerCase();
  const filtered = filter
    ? TREE_CACHE.filter((n: any) =>
        (n.category?.toLowerCase() ?? "").includes(filter) ||
        n.name.toLowerCase().includes(filter)
      )
    : TREE_CACHE;

  return NextResponse.json({ name: "All National Outcomes", children: filtered });
}
