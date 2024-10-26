"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NoteEditor from "@/components/NoteEditor";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!params.id) return;
      setIsLoading(true);
      setError(null);
      try {
        console.log("Fetching note with ID:", params.id);
        const response = await fetch(`/api/notes/${params.id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          console.error(
            "Response not OK:",
            response.status,
            response.statusText
          );
          const errorText = await response.text();
          console.error("Error response:", errorText);
          if (response.status === 404) {
            throw new Error("Note non trouvée");
          }
          throw new Error("Erreur lors du chargement de la note");
        }
        const data = await response.json();
        console.log("Received note data:", data);
        setNote(data);
      } catch (error) {
        console.error("Erreur:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id]);

  const handleSave = async () => {
    if (!params.id) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde de la note");
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
      className="container mx-auto p-4 max-w-4xl"
    >
      <Toaster position="top-right" />
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          <FiArrowLeft className="mr-2" /> Retour
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
      </div>
      <Input
        type="text"
        value={note.title}
        onChange={(e) => setNote({ ...note, title: e.target.value })}
        placeholder="Titre de la note"
        className="mb-4"
      />
      <NoteEditor
        content={note.content}
        onChange={(content) => setNote({ ...note, content })}
      />
    </motion.div>
  );
}
