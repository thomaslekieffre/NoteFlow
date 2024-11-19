export type Operation = {
  type: "insert" | "delete" | "replace";
  position: number;
  text: string;
  userId: string;
  timestamp: number;
};

export type DocumentState = {
  content: string;
  version: number;
};
