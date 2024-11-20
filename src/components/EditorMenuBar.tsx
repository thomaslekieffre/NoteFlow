"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { FontSizeSelector } from "./ui/font-size-selector";
import { FiImage } from "react-icons/fi";
import { useRef } from "react";

type MenuBarProps = {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<void>;
};

type Level = 1 | 2 | 3;

export default function MenuBar({ editor, onImageUpload }: MenuBarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
      imageInputRef.current.click();
    }
  };

  return (
    <div className="border-b p-2 flex flex-wrap items-center gap-2">
      <FontSizeSelector editor={editor} />
      <Select
        onValueChange={(value) => {
          if (value === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else {
            editor
              .chain()
              .focus()
              .toggleHeading({ level: parseInt(value) as Level })
              .run();
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Style de texte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Normal</SelectItem>
          <SelectItem value="1">Titre 1</SelectItem>
          <SelectItem value="2">Titre 2</SelectItem>
          <SelectItem value="3">Titre 3</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-2"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="p-2"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="p-2"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("code") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="p-2"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-2"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="p-2"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onImageUpload) {
            onImageUpload(file);
            e.target.value = "";
          }
        }}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleImageClick}
        className="px-2"
        title="Ajouter une image"
      >
        <FiImage className="h-4 w-4" />
      </Button>
    </div>
  );
}
