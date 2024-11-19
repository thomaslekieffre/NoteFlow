import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function formatLastModified(date: string | Date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: fr,
  });
}
