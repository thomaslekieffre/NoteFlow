"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FiPlus, FiFileText, FiMail, FiArchive, FiEdit } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [notesCount, setNotesCount] = useState(0);
  const [maxNotes, setMaxNotes] = useState(100);
  const [invitations, setInvitations] = useState(0);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    } else if (user) {
      fetchUserData();
    }
  }, [isLoaded, user, router]);

  const fetchUserData = async () => {
    // Ici, vous feriez un appel API pour récupérer les vraies données
    setNotesCount(15);
    setMaxNotes(100);
    setInvitations(3);
    setRecentNotes([
      { id: "1", title: "Note 1", updatedAt: "2024-11-01" },
      { id: "2", title: "Note 2", updatedAt: "2024-11-02" },
      { id: "3", title: "Note 3", updatedAt: "2024-11-03" },
    ]);
  };

  const handleCreateNote = async () => {
    setIsCreatingNote(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Nouvelle note",
          content: "Contenu de la nouvelle note",
        }),
      });

      const responseText = await response.text();
      console.log("Réponse brute du serveur:", responseText);

      if (!response.ok) {
        throw new Error(
          `Échec de la création de la note: ${response.status} ${response.statusText}\n${responseText}`
        );
      }

      let newNote;
      try {
        newNote = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erreur lors du parsing de la réponse JSON:", parseError);
        throw new Error("La réponse du serveur n'est pas un JSON valide");
      }

      setRecentNotes((prevNotes) => [newNote, ...prevNotes.slice(0, 2)]);
      setNotesCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Erreur détaillée lors de la création de la note:", error);
      alert(
        "Erreur lors de la création de la note : " + (error as Error).message
      );
    } finally {
      setIsCreatingNote(false);
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-3xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Tableau de Bord
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiFileText className="mr-2" /> Vos Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {notesCount} / {maxNotes}
              </p>
              <p className="text-sm text-gray-500">Notes créées</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiMail className="mr-2" /> Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{invitations}</p>
              <p className="text-sm text-gray-500">Invitations en attente</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiPlus className="mr-2" /> Nouvelle Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={handleCreateNote}
                disabled={isCreatingNote}
              >
                {isCreatingNote ? "Création en cours..." : "Créer une note"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiArchive className="mr-2" /> Archives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Voir les archives
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Notes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentNotes.map((note) => (
                <li key={note.id} className="flex items-center justify-between">
                  <Link
                    href={`/notes/${note.id}`}
                    className="flex items-center hover:underline"
                  >
                    <FiEdit className="mr-2" />
                    {note.title}
                  </Link>
                  <span className="text-sm text-gray-500">
                    {note.updatedAt}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
