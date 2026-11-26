import { motion, useReducedMotion } from "framer-motion";

export default function PageTransition({ children, compact = false }) {
  const reduced = useReducedMotion();
  const travel = compact ? 0 : 10;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: travel }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -travel }}
      transition={{ duration: reduced ? 0 : compact ? 0.14 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
