'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

export function PageTransitionWrapper({ children }: { children: ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
