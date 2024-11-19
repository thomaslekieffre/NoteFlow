"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiTag } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Tag } from "@/types";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TagSelectorProps {
  noteId: string;
  initialTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  isFilterMode?: boolean;
}

export function TagSelector({
  noteId,
  initialTags = [],
  onTagsChange,
  isFilterMode = false,
}: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des tags");
      const data = await response.json();
      setAvailableTags(data);
    } catch (error) {
      toast.error("Impossible de charger les tags");
    }
  };

  const createTag = async () => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName, color: newTagColor }),
      });

      if (!response.ok) throw new Error("Erreur lors de la création du tag");

      const newTag = await response.json();
      setAvailableTags([...availableTags, newTag]);
      setNewTagName("");
      toast.success("Tag créé avec succès");
    } catch (error) {
      toast.error("Impossible de créer le tag");
    }
  };

  const addTagToNote = async (tag: Tag) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: tag.id }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'ajout du tag");

      const updatedTags = [...initialTags, tag];
      onTagsChange(updatedTags);
      toast.success("Tag ajouté avec succès");
    } catch (error) {
      toast.error("Impossible d'ajouter le tag");
    }
  };

  const removeTagFromNote = async (tagId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/tags/${tagId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression du tag");

      const updatedTags = initialTags.filter((t) => t.id !== tagId);
      onTagsChange(updatedTags);
      toast.success("Tag supprimé avec succès");
    } catch (error) {
      toast.error("Impossible de supprimer le tag");
    }
  };

  const deleteTagCompletely = async (tagId: string) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement ce tag ?"
      )
    ) {
      try {
        const response = await fetch(`/api/tags/${tagId}`, {
          method: "DELETE",
        });

        if (!response.ok)
          throw new Error("Erreur lors de la suppression du tag");

        setAvailableTags(availableTags.filter((t) => t.id !== tagId));
        const updatedTags = initialTags.filter((t) => t.id !== tagId);
        onTagsChange(updatedTags);

        toast.success("Tag supprimé définitivement");
      } catch (error) {
        console.error("Erreur de suppression:", error);
        toast.error("Impossible de supprimer le tag");
      }
    }
  };

  // Fonction pour vérifier si un tag est déjà présent
  const isTagPresent = (tagToCheck: Tag) => {
    return initialTags.some((existingTag) => existingTag.id === tagToCheck.id);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {initialTags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color }}
          className="flex items-center gap-1 px-2 py-1"
        >
          {tag.name}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeTagFromNote(tag.id);
            }}
            className="ml-1 hover:text-red-500"
          >
            ×
          </button>
        </Badge>
      ))}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Gérer les tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newTagName">Nouveau tag</Label>
              <div className="flex gap-2">
                <Input
                  id="newTagName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Nom du tag"
                />
                <Input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-16 p-1"
                />
                <Button onClick={createTag} size="sm" disabled={!newTagName}>
                  Créer
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Tags existants</Label>
              {availableTags.map((tag) => {
                const isPresent = isTagPresent(tag);
                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => addTagToNote(tag)}
                        size="sm"
                        variant="outline"
                        disabled={isPresent}
                      >
                        {isPresent ? "Déjà ajouté" : "Ajouter"}
                      </Button>
                      <Button
                        onClick={() => deleteTagCompletely(tag.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
