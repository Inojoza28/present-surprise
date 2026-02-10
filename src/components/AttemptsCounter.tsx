import { useEffect, useState } from "react";

interface AttemptsCounterProps {
  attempts: number;
  maxAttempts: number;
  animate: boolean;
}

const AttemptsCounter = ({ attempts, maxAttempts, animate }: AttemptsCounterProps) => {
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (animate) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [attempts, animate]);

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-5 py-3 rounded-full shadow-lg border border-border">
      <span className="text-sm font-semibold text-muted-foreground">Tentativas:</span>
      <span
        className={`
          text-2xl font-black text-primary transition-transform
          ${pop ? "scale-150" : "scale-100"}
        `}
        style={{
          animation: pop ? "counter-pop 0.5s ease-out" : undefined,
          transition: "transform 0.3s ease",
        }}
      >
        {attempts}
      </span>
      <span className="text-sm text-muted-foreground">/ {maxAttempts}</span>
    </div>
  );
};

export default AttemptsCounter;
