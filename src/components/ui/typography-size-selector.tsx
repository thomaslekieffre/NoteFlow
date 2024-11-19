import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function TypographySizeSelector({
  onChange,
}: {
  onChange: (size: string) => void;
}) {
  return (
    <Select onValueChange={onChange} defaultValue="base">
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Taille du texte" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="xs">Très petit</SelectItem>
        <SelectItem value="sm">Petit</SelectItem>
        <SelectItem value="base">Normal</SelectItem>
        <SelectItem value="lg">Grand</SelectItem>
        <SelectItem value="xl">Très grand</SelectItem>
      </SelectContent>
    </Select>
  );
}
