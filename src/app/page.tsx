"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { FiEdit3, FiClock, FiUsers } from "react-icons/fi";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
        <motion.a
          className="flex items-center justify-center"
          href="#"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-bold text-2xl">NoteFlow</span>
        </motion.a>
        <motion.nav
          className="flex items-center gap-4 sm:gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Fonctionnalités
          </a>
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Tarifs
          </a>
          <a
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Contact
          </a>
          <ThemeToggle />
        </motion.nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.h1
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TypeAnimation
                  sequence={[
                    "Bienvenue sur NoteFlow",
                    1500,
                    "Bienvenue sur votre espace de travail",
                    1500,
                    "Bienvenue sur votre plateforme collaborative",
                    1500,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </motion.h1>
              <motion.p
                className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Votre plateforme de prise de notes collaborative en temps réel
              </motion.p>
              <motion.div
                className="space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <SignInButton mode="modal">
                  <Button>Commencer</Button>
                </SignInButton>
                <Button variant="outline">En savoir plus</Button>
              </motion.div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <motion.h2
              className="text-2xl font-bold text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Fonctionnalités principales
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <FiEdit3 className="text-4xl mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  Édition en temps réel
                </h3>
                <p>Collaborez sur vos notes en temps réel avec votre équipe.</p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <FiClock className="text-4xl mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  Historique des versions
                </h3>
                <p>Accédez à l&apos;historique complet de vos modifications.</p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <FiUsers className="text-4xl mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  Collaboration d&apos;équipe
                </h3>
                <p>Partagez et collaborez facilement avec votre équipe.</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <motion.footer
        className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 NoteFlow. Tous droits réservés.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Conditions d&apos;utilisation
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Politique de confidentialité
          </a>
        </nav>
      </motion.footer>
    </div>
  );
}
