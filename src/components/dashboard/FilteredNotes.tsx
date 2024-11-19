import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FiFileText } from "react-icons/fi";
import { Tag } from "@/types";

interface Note {
  id: string;
  title: string;
  updatedAt: string;
  tags?: Tag[];
}

export function FilteredNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes filtrées</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="flex items-center justify-between">
              <Link
                href={`/notes/${note.id}`}
                className="flex items-center hover:underline"
              >
                <FiFileText className="mr-2" />
                {note.title}
              </Link>
              <div className="flex gap-2">
                {note.tags?.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color }}
                    className="text-xs"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
