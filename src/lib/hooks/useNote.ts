import useSWR, { KeyedMutator } from "swr";

interface NoteData {
  title: string;
  content: string;
  id: number;
  created_at: Date;
  updated_at: Date;
}

interface UseNoteReturn {
  data: NoteData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  refresh: KeyedMutator<NoteData>;
}

export function useNote(noteId: string | undefined): UseNoteReturn {
  const fetcher = async (url: string): Promise<NoteData> => {
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors du chargement de la note");
    }
    const data = await response.json();
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  };

  const { data, error, isLoading, mutate } = useSWR<NoteData>(
    noteId ? `/api/notes/${noteId}` : null,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}
