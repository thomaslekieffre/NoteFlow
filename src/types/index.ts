import { type } from "os";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface NoteData extends Note {
  tags?: Tag[];
}
