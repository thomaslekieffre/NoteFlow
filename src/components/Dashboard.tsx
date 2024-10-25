import React from "react";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Tableau de bord</h2>
      <p className="mb-4">Bienvenue sur votre espace personnel !</p>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
