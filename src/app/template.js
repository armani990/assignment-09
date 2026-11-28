
"use client";

import { MotionConfig } from "framer-motion";
import PageTransition from "@/components/page-transition";

export default function Template({ children }) {
  return (
    <MotionConfig reducedMotion="user">
      <PageTransition>{children}</PageTransition>
    </MotionConfig>
  );
}
