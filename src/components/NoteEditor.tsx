import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { io, Socket } from "socket.io-client";
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
import Image from "@tiptap/extension-image";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  title: string;
  content: string;
  onChange: (content: string) => void;
  noteId: string;
  user: {
    id: string;
    fullName: string;
  };
  onEditorReady?: (editor: Editor) => void;
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
  title,
  content,
  onChange,
  noteId,
  user,
  onEditorReady,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const skipNextUpdate = useRef(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("noteId", noteId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      if (editor) {
        editor
          .chain()
          .focus()
          .setImage({
            src: data.url,
            alt: file.name,
            title: file.name,
          })
          .run();

        const newContent = editor.getHTML();
        onChange(newContent);

        socket?.emit("document-update", {
          documentId: noteId,
          userId: user.id,
          content: newContent,
        });
      }

      toast.success("Image ajoutée avec succès");
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Document,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Placeholder.configure({
        placeholder: "Commencez à écrire...",
      }),
      ListExit,
      Bold,
      Italic,
      Strike,
      Code,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      TextStyle,
      FontSize,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (skipNextUpdate.current) {
        skipNextUpdate.current = false;
        return;
      }
      const newContent = editor.getHTML();
      onChange(newContent);
      socket?.emit("document-update", {
        documentId: noteId,
        userId: user.id,
        content: newContent,
      });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const images = Array.from(event.dataTransfer.files).filter((file) =>
            file.type.startsWith("image/")
          );
          if (images.length > 0) {
            event.preventDefault();
            images.forEach((image) => handleImageUpload(image));
            return true;
          }
        }
        return false;
      },
    },
    onBeforeCreate({ editor }) {
      onEditorReady?.(editor);
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
        <MenuBar editor={editor} onImageUpload={handleImageUpload} />
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
