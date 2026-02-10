import { useState, useEffect, useCallback } from "react";

interface GiftBoxProps {
  index: number;
  colorClass: string;
  isDisabled: boolean;
  onOpen: (index: number) => void;
  isRemoved: boolean;
}

const giftEmojis = ["🎁", "🎀", "💝", "🎊", "✨", "🌟"];

const GiftBox = ({ index, colorClass, isDisabled, onOpen, isRemoved }: GiftBoxProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [floatDelay] = useState(() => Math.random() * 2);

  const handleClick = useCallback(() => {
    if (isDisabled || isOpening || isRemoved) return;
    setIsOpening(true);
    setTimeout(() => onOpen(index), 600);
  }, [isDisabled, isOpening, isRemoved, onOpen, index]);

  if (isRemoved) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || isOpening}
      className={`
        relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl cursor-pointer
        transition-all duration-300 select-none
        ${colorClass}
        ${isOpening ? "scale-110 opacity-0" : ""}
        ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:scale-110 active:scale-95"}
      `}
      style={{
        animation: !isDisabled && !isOpening
          ? `gift-float 3s ease-in-out ${floatDelay}s infinite, gift-pulse 2s ease-in-out ${floatDelay + 0.5}s infinite`
          : undefined,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Ribbon vertical */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-full bg-white/30 rounded-full" />
      {/* Ribbon horizontal */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-3 bg-white/30 rounded-full" />
      {/* Bow */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl">
        🎀
      </div>
      {/* Emoji */}
      <span className="relative z-10 text-3xl sm:text-4xl flex items-center justify-center h-full">
        {giftEmojis[index]}
      </span>
      {/* Shine effect */}
      {!isDisabled && !isOpening && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      )}
      {/* Opening glow */}
      {isOpening && (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ animation: "glow-burst 0.6s ease-out forwards" }}
        >
          <div className="w-full h-full rounded-2xl glow-intense" />
        </div>
      )}
    </button>
  );
};

export default GiftBox;
