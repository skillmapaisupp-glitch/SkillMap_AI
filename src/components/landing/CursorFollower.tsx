import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface Trail {
  id: number;
  x: number;
  y: number;
}

const TRAIL_LENGTH = 8;
let trailId = 0;

const CursorFollower = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [trails, setTrails] = useState<Trail[]>([]);
  const lastTrailPos = useRef({ x: 0, y: 0 });

  const addTrail = useCallback((x: number, y: number) => {
    const dx = x - lastTrailPos.current.x;
    const dy = y - lastTrailPos.current.y;
    if (dx * dx + dy * dy < 100) return; // min 10px distance
    lastTrailPos.current = { x, y };
    trailId++;
    setTrails((prev) => [...prev.slice(-(TRAIL_LENGTH - 1)), { id: trailId, x, y }]);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      addTrail(e.clientX, e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        !!target.closest("a, button, [role='button'], input, textarea, select")
      );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [addTrail]);

  // Clean up old trails
  useEffect(() => {
    if (trails.length === 0) return;
    const timeout = setTimeout(() => {
      setTrails((prev) => prev.slice(1));
    }, 120);
    return () => clearTimeout(timeout);
  }, [trails]);

  return (
    <>
      {/* Trail particles */}
      {trails.map((trail, i) => {
        const progress = (i + 1) / TRAIL_LENGTH;
        const size = 4 + progress * 3;
        return (
          <motion.div
            key={trail.id}
            className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full bg-primary"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              left: trail.x - size / 2,
              top: trail.y - size / 2,
              width: size,
              height: size,
              boxShadow: `0 0 ${6 + progress * 4}px hsl(38 92% 50% / ${0.2 * progress})`,
            }}
          />
        );
      })}

      {/* Outer glow ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-primary/40 mix-blend-screen"
        animate={{
          x: position.x - (isHovering ? 24 : 18),
          y: position.y - (isHovering ? 24 : 18),
          width: isHovering ? 48 : 36,
          height: isHovering ? 48 : 36,
          opacity: 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
        style={{ boxShadow: "0 0 12px hsl(38 92% 50% / 0.15)" }}
      />
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-primary"
        animate={{
          x: position.x - (isHovering ? 3 : 4),
          y: position.y - (isHovering ? 3 : 4),
          width: isHovering ? 6 : 8,
          height: isHovering ? 6 : 8,
          opacity: isHovering ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.3 }}
      />
    </>
  );
};

export default CursorFollower;
