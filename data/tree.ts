export type RawNode = {
  name: string;
  category?: string;
  children?: RawNode[];
  code?: string;
  impact?: string;
  status? : string;
};

export const TREE_KPI: RawNode[] = []