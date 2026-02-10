import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  active: boolean;
  intensity?: "low" | "high";
}

const ConfettiEffect = ({ active, intensity = "low" }: ConfettiEffectProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (intensity === "high") {
      // Big celebration burst
      const duration = 8000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#e8738a", "#d4973b", "#5bb5d5", "#b07ed4"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#e8738a", "#d4973b", "#5bb5d5", "#b07ed4"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Continuous gentle confetti
      intervalRef.current = setInterval(() => {
        confetti({
          particleCount: 2,
          angle: 90,
          spread: 120,
          origin: { x: Math.random(), y: -0.1 },
          colors: ["#e8738a", "#d4973b", "#5bb5d5", "#b07ed4"],
          gravity: 0.6,
          drift: 0,
        });
      }, 300);
    } else {
      // Small burst
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#e8738a", "#d4973b", "#5bb5d5"],
      });
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, intensity]);

  return null;
};

export default ConfettiEffect;
