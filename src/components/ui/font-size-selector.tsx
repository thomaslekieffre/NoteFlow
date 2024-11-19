import { Input } from "./input";
import { Label } from "./label";
import { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";

export function FontSizeSelector({ editor }: { editor: Editor }) {
  const [fontSize, setFontSize] = useState("14");

  useEffect(() => {
    const handleSelectionUpdate = () => {
      const currentSize = editor.getAttributes("textStyle").fontSize;
      if (typeof currentSize === "string") {
        setFontSize(currentSize);
      }
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("focus", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
      editor.off("focus", handleSelectionUpdate);
    };
  }, [editor]);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="fontSize" className="text-sm whitespace-nowrap">
        Taille :
      </Label>
      <Input
        id="fontSize"
        type="number"
        value={fontSize}
        min={8}
        max={72}
        className="w-20"
        onChange={(e) => {
          const newSize = e.target.value;
          setFontSize(newSize);
          editor.chain().focus().setFontSize(newSize).run();
        }}
      />
      <span className="text-sm">px</span>
    </div>
  );
}
