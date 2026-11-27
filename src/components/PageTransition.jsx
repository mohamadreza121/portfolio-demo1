import { motion, useReducedMotion, useIsPresent } from "framer-motion";

export default function PageTransition({ children, compact = false, rackPreview = false, rackDeparture = false }) {
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const travel = compact ? 0 : 10;
  const arrival = rackPreview ? { opacity: 0, filter: "blur(5px)" } : { opacity: 0, y: travel };
  const visible = rackPreview ? { opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" } } : { opacity: 1, y: 0 };

  return (
    <motion.div
      style={!present && rackDeparture ? { position: "absolute", inset: 0, width: "100%" } : undefined}
      initial={reduced || rackPreview ? false : arrival}
      animate={visible}
      exit={reduced ? undefined : { opacity: 0, y: -travel }}
      transition={{ duration: reduced ? 0 : rackPreview ? 0.4 : compact ? 0.14 : 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
