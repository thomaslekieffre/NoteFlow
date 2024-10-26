import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <EditorContent
        editor={editor}
        className="min-h-[300px] p-4 focus:outline-none"
      />
    </div>
  );
};

export default NoteEditor;
