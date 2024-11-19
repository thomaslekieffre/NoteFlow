"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiFileText,
  FiMail,
  FiArchive,
  FiEdit,
  FiTrash2,
  FiMoreHorizontal,
  FiShare2,
} from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toaster, toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TagSelector } from "@/components/ui/tag-selector";
import { formatLastModified } from "@/lib/utils/formatDate";

interface Note {
  id: string;
  title: string;
  updatedAt: string;
  tags?: Tag[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface NoteWithTags extends Note {
  tags?: Tag[];
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [notesCount, setNotesCount] = useState(0);
  const [maxNotes, setMaxNotes] = useState(100);
  const [invitations, setInvitations] = useState(0);
  const [recentNotes, setRecentNotes] = useState<NoteWithTags[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteWithTags[]>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [collaborationCode, setCollaborationCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    } else if (user) {
      fetchUserData();
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des tags");
        const data = await response.json();
        setAvailableTags(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les tags");
      }
    };

    fetchTags();
  }, []);

  const fetchUserData = async (currentSelectedTags?: number[]) => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setRecentNotes(data.recentNotes.slice(0, 3));
      setNotesCount(data.count);

      if (currentSelectedTags?.length || selectedTags.length) {
        const tagsToUse = currentSelectedTags || selectedTags;
        const filtered = data.recentNotes.filter((note: NoteWithTags) =>
          note.tags?.some((noteTag) => tagsToUse.includes(Number(noteTag.id)))
        );
        setFilteredNotes(filtered);
      } else {
        setFilteredNotes([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setNotesCount(0);
      setRecentNotes([]);
      setFilteredNotes([]);
    }
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Échec de la création de la note: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const newNote = await response.json();
      console.log("Nouvelle note créée:", newNote);

      router.push(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("Erreur lors de la création de la note:", error);
      alert(
        "Erreur lors de la création de la note : " + (error as Error).message
      );
    } finally {
      setIsCreatingNote(false);
      await fetchUserData();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression de la note");
        }

        toast("Note supprimée avec succès", {
          icon: "🗑️",
        });
        fetchUserData();
      } catch (error) {
        console.error("Erreur lors de la suppression de la note:", error);
        toast.error("Impossible de supprimer la note");
      }
    }
  };

  const handleShareNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création du lien de partage");
      }
      const { shareId } = await response.json();
      const link = `${window.location.origin}/shared/${shareId}`;

      await navigator.clipboard.writeText(link);

      toast.success("Lien de partage copié dans le presse-papiers");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de créer le lien de partage");
    }
  };

  const handleJoinCollaboration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    try {
      const response = await fetch("/api/collaborate/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: collaborationCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Code de collaboration invalide");
      }

      const { noteId } = await response.json();
      toast.success("Vous avez rejoint la note avec succès");
      router.push(`/notes/${noteId}`);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de rejoindre la note");
    } finally {
      setIsJoining(false);
      setCollaborationCode("");
    }
  };

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{
                        backgroundColor: selectedTags.includes(Number(tag.id))
                          ? tag.color
                          : "transparent",
                        color: selectedTags.includes(Number(tag.id))
                          ? "white"
                          : "currentColor",
                        cursor: "pointer",
                        border: `1px solid ${tag.color}`,
                      }}
                      onClick={() => {
                        const tagIdNumber = Number(tag.id);
                        const newSelectedTags = selectedTags.includes(
                          tagIdNumber
                        )
                          ? selectedTags.filter((id) => id !== tagIdNumber)
                          : [...selectedTags, tagIdNumber];
                        setSelectedTags(newSelectedTags);
                        fetchUserData(newSelectedTags);
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Rejoindre une collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinCollaboration} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Code de collaboration"
                    value={collaborationCode}
                    onChange={(e) =>
                      setCollaborationCode(e.target.value.toUpperCase())
                    }
                    maxLength={6}
                    className="flex-grow"
                  />
                  <Button type="submit" disabled={isJoining}>
                    {isJoining ? "Connexion..." : "Rejoindre"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiFileText className="mr-2" /> Notes récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentNotes.length > 0 ? (
                  <ul className="space-y-2">
                    {recentNotes.map((note: NoteWithTags) => (
                      <li
                        key={note.id}
                        className="flex items-center justify-between p-3 rounded-lg shadow dark:shadow-gray-800"
                      >
                        <Link
                          href={`/notes/${note.id}`}
                          className="flex items-center hover:underline flex-grow text-black dark:text-white"
                        >
                          <FiFileText className="mr-2" />
                          {note.title}
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mx-2">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <FiMoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/notes/${note.id}`)}
                            >
                              <FiEdit className="mr-2 h-4 w-4" />
                              <span>Éditer</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShareNote(note.id)}
                            >
                              <FiShare2 className="mr-2 h-4 w-4" />
                              <span>Partager</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Aucune note récente
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {filteredNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notes filtrées</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {filteredNotes.map((note: NoteWithTags) => (
                      <li key={note.id} className="flex flex-col gap-2">
                        <Link
                          href={`/notes/${note.id}`}
                          className="flex items-center hover:underline flex-grow text-black dark:text-white"
                        >
                          <FiFileText className="mr-2" />
                          {note.title}
                        </Link>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mx-2">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex flex-wrap gap-1">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <FiMoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/notes/${note.id}`)}
                            >
                              <FiEdit className="mr-2 h-4 w-4" />
                              <span>Éditer</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleShareNote(note.id)}
                            >
                              <FiShare2 className="mr-2 h-4 w-4" />
                              <span>Partager</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <FiTrash2 className="mr-2 h-4 w-4" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
