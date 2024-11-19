import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiFileText } from "react-icons/fi";

interface StatsCardsProps {
  notesCount: number;
}

export function StatsCards({ notesCount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notes totales</CardTitle>
          <FiFileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{notesCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
