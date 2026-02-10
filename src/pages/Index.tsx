import { useState, useCallback, useEffect, useRef } from "react";
import GiftBox from "@/components/GiftBox";
import AttemptsCounter from "@/components/AttemptsCounter";
import ConfettiEffect from "@/components/ConfettiEffect";
import FloatingHearts from "@/components/FloatingHearts";

type GamePhase = "intro" | "playing" | "reveal" | "prize" | "redirect";

interface RevealData {
  message: string;
  emoji: string;
  type: "empty" | "hug" | "bonus" | "kiss" | "tension" | "final";
}

const GIFT_COLORS = [
  "bg-gift-1 shadow-[0_8px_30px_hsl(340_70%_65%/0.3)]",
  "bg-gift-2 shadow-[0_8px_30px_hsl(200_70%_60%/0.3)]",
  "bg-gift-3 shadow-[0_8px_30px_hsl(45_85%_60%/0.3)]",
  "bg-gift-4 shadow-[0_8px_30px_hsl(280_60%_65%/0.3)]",
  "bg-gift-5 shadow-[0_8px_30px_hsl(160_55%_50%/0.3)]",
  "bg-gift-6 shadow-[0_8px_30px_hsl(15_80%_60%/0.3)]",
];

const REVEAL_SEQUENCE: RevealData[] = [
  { message: "Hmm… essa estava vazia 😅", emoji: "📭", type: "empty" },
  { message: "Um abraço bem apertado pra você! 🤗", emoji: "🫂", type: "hug" },
  { message: "Você ganhou +2 tentativas! 🎉", emoji: "🎰", type: "bonus" },
  { message: "Um beijo com muito carinho! 💋", emoji: "😘", type: "kiss" },
  { message: "Que sorte! Você ganhou mais uma tentativa! 🍀", emoji: "🎰", type: "tension" },
  { message: "", emoji: "🏆", type: "final" },
];

// Fixed order: boxes are opened in the order user clicks, but reveal is sequential
const Index = () => {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [attempts, setAttempts] = useState(3);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [openedCount, setOpenedCount] = useState(0);
  const [removedBoxes, setRemovedBoxes] = useState<Set<number>>(new Set());
  const [revealMessage, setRevealMessage] = useState<RevealData | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [animateCounter, setAnimateCounter] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiIntensity, setConfettiIntensity] = useState<"low" | "high">("low");

  // Final prize states
  const [showNada, setShowNada] = useState(false);
  const [nadaText, setNadaText] = useState("Nada");
  const [showJk, setShowJk] = useState(false);
  const [showPrize, setShowPrize] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleBoxOpen = useCallback((boxIndex: number) => {
    if (isProcessing || attempts <= 0) return;
    setIsProcessing(true);

    const currentReveal = REVEAL_SEQUENCE[openedCount];

    // Consume attempt
    if (currentReveal.type !== "bonus") {
      setAttempts((a) => a - 1);
    }

    setAnimateCounter(true);
    setTimeout(() => setAnimateCounter(false), 600);

    // Remove box
    setRemovedBoxes((prev) => new Set([...prev, boxIndex]));

    // Check if final
    if (currentReveal.type === "final") {
      setOpenedCount((c) => c + 1);
      handleFinalSequence();
      return;
    }

    // Show reveal
    setRevealMessage(currentReveal);
    setShowReveal(true);

    // Type-specific effects
    if (currentReveal.type === "hug") {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 4000);
    }
    if (currentReveal.type === "bonus") {
      setShowConfetti(true);
      setConfettiIntensity("low");
      setTimeout(() => {
        setAttempts((a) => a + 2);
        setMaxAttempts((m) => m + 2);
        setAnimateCounter(true);
        setTimeout(() => setAnimateCounter(false), 600);
      }, 500);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    if (currentReveal.type === "kiss") {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 4000);
    }
    if (currentReveal.type === "tension") {
      // Vibrate on mobile
      if (navigator.vibrate) navigator.vibrate(200);
    }

    // Hide reveal after delay (longer for emotional impact)
    setTimeout(() => {
      setShowReveal(false);
      setRevealMessage(null);
      setOpenedCount((c) => c + 1);
      setIsProcessing(false);
    }, 5500);
  }, [isProcessing, attempts, openedCount]);

  const handleFinalSequence = useCallback(() => {
    setPhase("reveal");

    // Step 1: Show "Nada"
    setTimeout(() => setShowNada(true), 800);

    // Step 2: Delete "Nada" letter by letter
    setTimeout(() => {
      const word = "Nada";
      let i = word.length;
      const deleteInterval = setInterval(() => {
        i--;
        setNadaText(word.substring(0, i));
        if (i <= 0) {
          clearInterval(deleteInterval);
          // Step 3: Type "Tô brincando 😅"
          setTimeout(() => {
            setShowJk(true);
            const phrase = "Tô brincando 😅";
            let j = 0;
            setNadaText("");
            const typeInterval = setInterval(() => {
              j++;
              setNadaText(phrase.substring(0, j));
              if (j >= phrase.length) {
                clearInterval(typeInterval);
                // Step 4: Prize reveal
                setTimeout(() => {
                  setShowNada(false);
                  setShowJk(false);
                  setPhase("prize");
                  setShowPrize(true);
                  setShowConfetti(true);
                  setConfettiIntensity("high");
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

                  // Step 5: Wait 10s then redirect
                  redirectTimerRef.current = setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => {
                      window.location.href = "https://youtu.be/PMKrAU1IlnA?si=YB_78rDIzfhzC33Z";
                    }, 1500);
                  }, 10000);
                }, 1200);
              }
            }, 80);
          }, 400);
        }
      }, 150);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  // Available boxes (not removed)
  const availableBoxes = Array.from({ length: 6 }, (_, i) => i).filter(
    (i) => !removedBoxes.has(i)
  );

  return (
    <div
      className={`
        min-h-screen gradient-warm flex flex-col items-center justify-center px-4 py-8
        transition-opacity duration-1500
        ${fadeOut ? "opacity-0" : "opacity-100"}
      `}
    >
      <ConfettiEffect active={showConfetti} intensity={confettiIntensity} />
      <FloatingHearts active={showHearts} />

      {/* INTRO PHASE */}
      {phase === "intro" && (
        <div
          className="text-center max-w-sm mx-auto"
          style={{ animation: "fade-up-in 0.8s ease-out" }}
        >
          <div className="text-6xl mb-6">🎂</div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            Surpresinha de Aniversário!
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Você tem <span className="font-bold text-primary">3 tentativas</span> para
            escolher entre 6 caixinhas.
          </p>
          <p className="text-muted-foreground mb-8">
            Escolha com cuidado… cada uma esconde algo especial! ✨
          </p>
          <button
            onClick={startGame}
            className="
              bg-primary text-primary-foreground font-bold text-lg
              px-8 py-4 rounded-full
              shadow-lg hover:shadow-xl
              transition-all duration-300
              hover:scale-105 active:scale-95
            "
            style={{ animation: "gift-pulse 2s ease-in-out infinite" }}
          >
            Começar! 🎁
          </button>
        </div>
      )}

      {/* PLAYING PHASE */}
      {phase === "playing" && (
        <div
          className="flex flex-col items-center gap-8 w-full max-w-md"
          style={{ animation: "fade-up-in 0.5s ease-out" }}
        >
          <AttemptsCounter
            attempts={attempts}
            maxAttempts={maxAttempts}
            animate={animateCounter}
          />

          <h2 className="text-xl font-bold text-foreground text-center">
            Escolha uma caixinha! 🎁
          </h2>

          <div className="grid grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <GiftBox
                key={i}
                index={i}
                colorClass={GIFT_COLORS[i]}
                isDisabled={isProcessing || attempts <= 0}
                onOpen={handleBoxOpen}
                isRemoved={removedBoxes.has(i)}
              />
            ))}
          </div>

          {/* Reveal overlay */}
          {showReveal && revealMessage && (
            <div
              className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 backdrop-blur-md"
              style={{ animation: "fade-up-in 0.5s ease-out" }}
            >
              <div
                className={`
                  bg-card rounded-3xl px-8 py-10 mx-4 max-w-sm w-full text-center 
                  shadow-2xl border-2 border-border relative overflow-hidden
                  ${revealMessage.type === "bonus" ? "border-accent glow-soft" : ""}
                  ${revealMessage.type === "tension" ? "border-primary" : ""}
                `}
                style={{ animation: "fade-up-in 0.6s ease-out" }}
              >
                {/* Decorative top glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                
                <div
                  className="text-7xl mb-5"
                  style={{ animation: "fade-up-in 0.8s ease-out 0.2s both" }}
                >
                  {revealMessage.emoji}
                </div>
                <p
                  className={`
                    text-xl sm:text-2xl font-extrabold leading-relaxed
                    ${revealMessage.type === "empty" ? "text-muted-foreground" : "text-foreground"}
                    ${revealMessage.type === "bonus" ? "text-gradient-gold" : ""}
                    ${revealMessage.type === "tension" ? "text-primary" : ""}
                  `}
                  style={{ animation: "fade-up-in 0.8s ease-out 0.4s both" }}
                >
                  {revealMessage.message}
                </p>

                {/* Subtitle per type */}
                {revealMessage.type === "empty" && (
                  <p className="text-sm text-muted-foreground mt-3" style={{ animation: "fade-up-in 0.8s ease-out 0.8s both" }}>
                    Não desanime, ainda tem mais! 💪
                  </p>
                )}
                {revealMessage.type === "hug" && (
                  <p className="text-sm text-muted-foreground mt-3" style={{ animation: "fade-up-in 0.8s ease-out 0.8s both" }}>
                    Sinta esse carinho de longe 💕
                  </p>
                )}
                {revealMessage.type === "bonus" && (
                  <p className="text-sm text-muted-foreground mt-3" style={{ animation: "fade-up-in 0.8s ease-out 0.8s both" }}>
                    A sorte está do seu lado! 🍀
                  </p>
                )}
                {revealMessage.type === "kiss" && (
                  <p className="text-sm text-muted-foreground mt-3" style={{ animation: "fade-up-in 0.8s ease-out 0.8s both" }}>
                    Feito com muito amor 💝
                  </p>
                )}
                {revealMessage.type === "tension" && (
                  <p className="text-sm text-muted-foreground mt-3 font-semibold" style={{ animation: "fade-up-in 0.8s ease-out 0.8s both" }}>
                    Agora é tudo ou nada… 😳
                  </p>
                )}

                {/* Bottom decorative dots */}
                <div className="flex justify-center gap-1.5 mt-5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/30"
                      style={{ animation: `gift-pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVEAL PHASE - Nada / Tô brincando */}
      {phase === "reveal" && (
        <div className="flex flex-col items-center justify-center text-center">
          {showNada && (
            <div style={{ animation: "fade-up-in 0.5s ease-out" }}>
              <p
                className={`text-5xl sm:text-6xl font-black ${showJk ? "text-primary" : "text-foreground"}`}
              >
                {nadaText}
                <span
                  className="inline-block w-1 h-10 sm:h-12 bg-foreground ml-1 align-middle"
                  style={{ animation: "typing-cursor 0.8s ease-in-out infinite" }}
                />
              </p>
            </div>
          )}
        </div>
      )}

      {/* PRIZE PHASE */}
      {phase === "prize" && showPrize && (
        <div
          className="flex flex-col items-center justify-center text-center gap-8"
          style={{ animation: "fade-up-in 1s ease-out" }}
        >
          <p
            className="text-muted-foreground text-base tracking-widest uppercase font-semibold"
            style={{ animation: "fade-up-in 0.8s ease-out 0.2s both" }}
          >
            Parabéns! 🎉
          </p>

          <div style={{ animation: "fade-up-in 1s ease-out 0.6s both" }}>
            <p
              className="text-7xl sm:text-8xl font-black text-gradient-gold"
              style={{ animation: "prize-glow 2.5s ease-in-out infinite" }}
            >
              R$150
            </p>
          </div>

          <p
            className="text-xl sm:text-2xl font-bold text-foreground/80"
            style={{ animation: "fade-up-in 0.8s ease-out 1s both" }}
          >
            no Pix 💸
          </p>

          <div
            className="w-16 h-0.5 rounded-full bg-gradient-to-r from-transparent via-accent/60 to-transparent"
            style={{ animation: "fade-up-in 0.8s ease-out 1.4s both" }}
          />

          <p
            className="text-muted-foreground text-sm"
            style={{ animation: "fade-up-in 1s ease-out 2s both" }}
          >
            Aguarde um instante… ✨
          </p>

          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="fixed text-2xl pointer-events-none"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `sparkle ${1.5 + Math.random()}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            >
              ✨
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
