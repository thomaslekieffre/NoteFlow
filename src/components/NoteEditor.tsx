import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { io } from "socket.io-client";
import MenuBar from "./EditorMenuBar";
import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";
import { exportNote } from "@/lib/utils/exportNote";
import { toast } from "react-hot-toast";
import { ListExit } from "@/lib/extensions/listExit";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import Document from "@tiptap/extension-document";
import { FontSize } from "@/lib/extensions/fontSize";
import TextStyle from "@tiptap/extension-text-style";

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  noteId: string;
  user: {
    id: string;
    fullName: string;
  };
  title: string;
}

const getWordCount = (text: string) => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

const getCharCount = (text: string) => {
  return text.length;
};

const NoteEditor: React.FC<NoteEditorProps> = ({
  content,
  onChange,
  noteId,
  user,
  title,
}) => {
  const [socket, setSocket] = useState<any>(null);
  const skipNextUpdate = useRef(false);

  const extensions = [
    Document,
    StarterKit.configure({
      document: false,
    }),
    Heading.configure({
      levels: [1, 2, 3],
    }),
    Placeholder.configure({
      placeholder: "Commencez à écrire...",
    }),
    ListExit,
    Bold.configure(),
    Italic.configure(),
    Strike.configure(),
    Code.configure(),
    TextStyle,
    FontSize,
  ];

  const editor = useEditor({
    extensions: extensions,
    content: content,
    onUpdate: ({ editor }) => {
      if (skipNextUpdate.current) {
        skipNextUpdate.current = false;
        return;
      }
      const newContent = editor.getHTML();
      onChange(newContent);
      socket?.emit("document-update", {
        noteId,
        userId: user.id,
        content: newContent,
      });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const updateSyntaxHighlighting = () => {
        document.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      };

      editor.on("update", () => {
        const selection = editor.state.selection;
        const isInCodeBlock = editor.isActive("codeBlock");

        if (!isInCodeBlock) {
          requestAnimationFrame(updateSyntaxHighlighting);
        }
      });

      updateSyntaxHighlighting();
    }
  }, [editor]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit("join-document", {
      documentId: noteId,
      userId: user.id,
    });

    newSocket.on(
      "document-update",
      (data: { content: string; userId: string }) => {
        if (data.userId !== user.id && editor) {
          skipNextUpdate.current = true;
          editor.commands.setContent(data.content);
        }
      }
    );

    return () => {
      newSocket.disconnect();
    };
  }, [noteId, user.id, editor]);

  useEffect(() => {
    if (editor && content) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  const handleExport = async () => {
    try {
      await exportNote(title, content);
      toast.success("Note exportée en PDF");
    } catch (error) {
      toast.error("Erreur lors de l'export");
    }
  };

  const wordCount = getWordCount(editor?.getText() || "");
  const charCount = getCharCount(editor?.getText() || "");

  return (
    <div className="note-editor">
      <div className="flex justify-between items-center mb-4">
        <MenuBar editor={editor} />
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleExport}
        >
          <FiDownload /> Exporter en PDF
        </Button>
      </div>
      <EditorContent editor={editor} />
      <div className="text-xs text-muted-foreground mt-2 flex justify-end gap-4">
        <span>{wordCount} mots</span>
        <span>{charCount} caractères</span>
      </div>
    </div>
  );
};

export default NoteEditor;
