import { useState, useEffect } from "react";

interface FloatingHeartsProps {
  active: boolean;
}

const FloatingHearts = ({ active }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<{ id: number; x: number; emoji: string }[]>([]);

  useEffect(() => {
    if (!active) return;
    const emojis = ["💕", "💖", "💗", "💝", "❤️", "😘"];
    let id = 0;
    const interval = setInterval(() => {
      setHearts((prev) => [
        ...prev.slice(-15),
        { id: id++, x: 20 + Math.random() * 60, emoji: emojis[Math.floor(Math.random() * emojis.length)] },
      ]);
    }, 300);

    const timeout = setTimeout(() => clearInterval(interval), 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute text-2xl sm:text-3xl"
          style={{
            left: `${h.x}%`,
            bottom: "20%",
            animation: "heart-float 2s ease-out forwards",
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingHearts;
