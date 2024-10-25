import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navigation() {
  return (
    <nav className="flex justify-between items-center p-4">
      <Link href="/dashboard" className="text-lg font-bold">
        NoteFlow
      </Link>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}
