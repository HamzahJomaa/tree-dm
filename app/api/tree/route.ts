import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

type TreeNode = {
  name?: string;
  code?: string;
  impact?: string;
  status?: string;
  category?: string;
  children?: TreeNode[];
};

let TREE_CACHE: TreeNode[] | null = null;

// ---- helpers ----
const toSet = (v?: string | null) =>
  new Set(
    (v ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

const includesAny = (value: string | undefined, needles: Set<string>) => {
  if (!needles.size) return true; // no filter on this field
  const hay = (value ?? "").toLowerCase();
  for (const n of needles) if (hay.includes(n)) return true;
  return false;
};

function nodeMatchesByStructuredQuery(node: TreeNode, qs: URLSearchParams): boolean {
  const codes = toSet(qs.get("code"));
  const impacts = toSet(qs.get("impact"));
  const statuses = toSet(qs.get("status"));

  return (
    includesAny(node.code, codes) &&
    includesAny(node.impact, impacts) &&
    includesAny(node.status, statuses)
  );
}

function nodeMatchesByLegacyFilter(node: TreeNode, text: string): boolean {
  const t = text.toLowerCase();
  return (
    (node.category?.toLowerCase() ?? "").includes(t) ||
    (node.code?.toLowerCase() ?? "").includes(t) ||
    (node.impact?.toLowerCase() ?? "").includes(t) ||
    (node.status?.toLowerCase() ?? "").includes(t) ||
    (node.name?.toLowerCase() ?? "").includes(t)
  );
}

/**
 * Prunes the tree with path preservation.
 * Additionally MASKS non-matching impact/status on kept ancestors so "Low" (or other non-matching) won't appear.
 */
function pruneWithMask(
  node: TreeNode,
  {
    predicate,
    activeImpacts,
    activeStatuses,
  }: {
    predicate: (n: TreeNode) => boolean;
    activeImpacts: Set<string>;
    activeStatuses: Set<string>;
  }
): TreeNode | null {
  const prunedChildren =
    node.children
      ?.map((c) => pruneWithMask(c, { predicate, activeImpacts, activeStatuses }))
      .filter(Boolean) as TreeNode[] | undefined;

  const selfMatches = predicate(node);
  const hasMatchingChild = (prunedChildren?.length ?? 0) > 0;

  if (!(selfMatches || hasMatchingChild)) return null;

  // Build the returned node
  const copy: TreeNode = {
    ...node,
    children: prunedChildren && prunedChildren.length > 0 ? prunedChildren : undefined,
  };

  // --- Mask non-matching meta on ancestors kept only for path preservation ---
  // If an impact filter is active, and this node does NOT itself match the impact,
  // remove its displayed impact so you don't see e.g. "Low" on ancestors.
  if (activeImpacts.size > 0 && !includesAny(node.impact, activeImpacts)) {
    delete (copy as any).impact;
  }
  // Same idea for status
  if (activeStatuses.size > 0 && !includesAny(node.status, activeStatuses)) {
    delete (copy as any).status;
  }

  return copy;
}

export async function GET(req: NextRequest) {
  // Lazy-load and cache the tree once
  if (!TREE_CACHE) {
    const filePath = path.join(process.cwd(), "data/level_one.json");
    const file = fs.readFileSync(filePath, "utf8");
    TREE_CACHE = JSON.parse(file) as TreeNode[];
    console.log("Loaded level_one.json once at startup");
  }

  const qs = req.nextUrl.searchParams;

  const codeParam = qs.get("code")?.trim();
  const impactParam = qs.get("impact")?.trim();
  const statusParam = qs.get("status")?.trim();
  const legacyFilter = qs.get("filter")?.trim();

  const hasStructured = !!(codeParam || impactParam || statusParam);

  let children: TreeNode[];

  if (hasStructured) {
    const impacts = toSet(impactParam);
    const statuses = toSet(statusParam);

    const predicate = (n: TreeNode) => nodeMatchesByStructuredQuery(n, qs);

    children = (TREE_CACHE as TreeNode[])
      .map((n) => pruneWithMask(n, { predicate, activeImpacts: impacts, activeStatuses: statuses }))
      .filter(Boolean) as TreeNode[];
  } else if (legacyFilter) {
    const predicate = (n: TreeNode) => nodeMatchesByLegacyFilter(n, legacyFilter);
    // No specific impact/status filters active → nothing to mask
    children = (TREE_CACHE as TreeNode[])
      .map((n) =>
        pruneWithMask(n, {
          predicate,
          activeImpacts: new Set<string>(),
          activeStatuses: new Set<string>(),
        })
      )
      .filter(Boolean) as TreeNode[];
  } else {
    children = TREE_CACHE as TreeNode[];
  }

  return NextResponse.json({
    name: "All National Outcomes",
    children,
  });
}
