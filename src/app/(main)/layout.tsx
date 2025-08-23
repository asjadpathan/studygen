
'use client';

import { MainHeader } from "@/components/main-header";
import { motion, AnimatePresence } from "framer-motion";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <MainHeader />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8"
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
