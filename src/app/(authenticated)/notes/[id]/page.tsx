"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NoteEditor from "@/components/NoteEditor";
import { FiSave, FiArrowLeft, FiShare2, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useUser } from "@/lib/auth";
import { useNote } from "@/lib/hooks/useNote";
import { TagSelector } from "@/components/ui/tag-selector";
import { NoteData, Tag } from "@/types";
import { formatLastModified } from "@/lib/utils/formatDate";

export default function NotePage() {
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const router = useRouter();
  const [note, setNote] = useState<NoteData>({
    id: 0,
    title: "",
    content: "",
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const debouncedUpdate = useRef<NodeJS.Timeout | null>(null);
  const { data: user } = useUser();
  const {
    data: noteData,
    error: noteError,
    isLoading: isNoteLoading,
    refresh,
  } = useNote(noteId);

  useEffect(() => {
    const initializeNote = async () => {
      if (noteData) {
        try {
          const response = await fetch(`/api/notes/${noteId}/tags`);
          if (!response.ok)
            throw new Error("Erreur lors de la récupération des tags");
          const tags: Tag[] = await response.json();

          const noteWithTags: NoteData = {
            ...noteData,
            tags: tags,
          };
          setNote(noteWithTags);
          setNoteTags(tags);
          setIsLoading(false);
        } catch (error) {
          console.error("Erreur:", error);
          toast.error("Impossible de charger les tags");
          setIsLoading(false);
        }
      }
    };

    initializeNote();
  }, [noteData, noteId]);

  useEffect(() => {
    console.log("Current note state:", note);
  }, [note]);

  useEffect(() => {
    if (noteError) {
      setError("Erreur lors du chargement de la note");
      setIsLoading(false);
    }
  }, [noteError]);

  const handleSave = async () => {
    if (!noteId) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          tags: note.tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      toast.success("Note sauvegardée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de sauvegarder la note");
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!noteId) return;
    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création du lien de partage");
      }
      const { shareId } = await response.json();
      const link = `${window.location.origin}/shared/${shareId}`;
      setShareLink(link);
      toast.success("Lien de partage créé avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de créer le lien de partage");
    }
  };

  const handleCreateCollaboration = async () => {
    if (!noteId) return;
    try {
      const response = await fetch(`/api/notes/${noteId}/collaborate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du code de collaboration");
      }

      const { code } = await response.json();
      toast.success(`Code de collaboration: ${code}`, {
        duration: 10000,
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de créer le code de collaboration");
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!noteId) return;

    setNote((prev: NoteData) => ({
      ...prev,
      content: newContent,
    }));

    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current);
    }

    debouncedUpdate.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: note.title,
            content: newContent,
            tags: note.tags,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la sauvegarde automatique");
        }

        toast.success("Note sauvegardée", {
          duration: 2000,
        });
      } catch (error) {
        console.error("Erreur de sauvegarde automatique:", error);
        toast.error("Erreur lors de la sauvegarde automatique");
      }
    }, 2000);
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setNoteTags(newTags);
    setNote((prevNote) => ({
      ...prevNote,
      tags: newTags,
    }));
  };

  useEffect(() => {
    const fetchTags = async () => {
      if (!noteId) return;
      try {
        const response = await fetch(`/api/notes/${noteId}/tags`);
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des tags");
        const data: Tag[] = await response.json();
        setNoteTags(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les tags");
      }
    };

    fetchTags();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erreur :</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 max-w-screen-lg"
    >
      <Toaster position="top-right" />
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          <FiArrowLeft className="mr-2" /> Retour
        </Button>
        <div className="flex space-x-2">
          <Button onClick={handleShare} variant="outline">
            <FiShare2 className="mr-2" /> Partager
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <FiSave className="mr-2" /> Sauvegarder
              </>
            )}
          </Button>
          <Button onClick={handleCreateCollaboration} variant="outline">
            <FiUsers className="mr-2" /> Inviter à collaborer
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <TagSelector
          noteId={noteId || ""}
          initialTags={noteTags}
          onTagsChange={handleTagsChange}
        />
      </div>
      {shareLink && (
        <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded">
          <p>
            Lien de partage :{" "}
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {shareLink}
            </a>
          </p>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <p className="text-sm text-muted-foreground">
            Dernière modification {formatLastModified(note.updated_at || "")}
          </p>
        </div>
      </div>
      <NoteEditor
        title={note?.title || ""}
        content={note?.content || ""}
        onChange={handleContentChange}
        noteId={noteId || ""}
        user={{
          id: user?.id || "",
          fullName: user?.fullName || "",
        }}
      />
    </motion.div>
  );
}
