import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import logoUrl from "@/assets/logo.png";
import Wheel from "@/components/Wheel";
import { getWheelPrizes, recordSpin } from "@/lib/wheel.functions";

type Props = {
  entryId: string;
  initialPrize?: string | null;
  onResult: (prize: string) => void;
};

export default function WheelStep({ entryId, initialPrize, onResult }: Props) {
  const spinFn = useServerFn(recordSpin);
  const prizesFn = useServerFn(getWheelPrizes);
  const [prizes, setPrizes] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [target, setTarget] = useState<number | null>(null);
  const [pendingPrize, setPendingPrize] = useState<string | null>(null);
  const [pendingPrizeIndex, setPendingPrizeIndex] = useState<number | null>(null);
  const [canStop, setCanStop] = useState(false);

  useEffect(() => {
    prizesFn().then((items) => setPrizes(items as string[]));
  }, [prizesFn]);

  useEffect(() => {
    if (initialPrize) onResult(initialPrize);
  }, [initialPrize]); // eslint-disable-line

  async function handleSpin() {
    if (spinning || prizes.length === 0) return;
    setSpinning(true);
    setCanStop(false);
    const res = await spinFn({ data: { id: entryId } });
    setPendingPrize(res.prize);
    setPendingPrizeIndex(res.prizeIndex);
    setTimeout(() => setCanStop(true), 1500);
  }

  function handleStop() {
    if (!pendingPrize || pendingPrizeIndex === null || !canStop || target !== null) return;
    setTarget(pendingPrizeIndex);
  }

  function handleComplete() {
    if (pendingPrize) onResult(pendingPrize);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-3 py-5 sm:px-4 sm:py-8">
      <header className="mb-3 text-center sm:mb-4">
        <img src={logoUrl} alt="Findes IEL" className="mx-auto h-12 sm:h-14" />
      </header>

      {prizes.length > 0 ? (
        <Wheel prizes={prizes} spinning={spinning} targetIndex={target} onSpinComplete={handleComplete} />
      ) : (
        <div className="grid h-[min(88vw,460px)] w-[min(88vw,460px)] place-items-center rounded-full border border-border bg-card text-sm text-muted-foreground">
          Carregando roleta...
        </div>
      )}

      <div className="mt-7 grid w-full max-w-xs grid-cols-2 gap-3 sm:mt-10 sm:max-w-sm sm:gap-4">
        <button className="btn-spin rounded-full px-6 py-3 text-sm sm:px-10 sm:text-base" disabled={spinning || prizes.length === 0} onClick={handleSpin}>
          GIRAR
        </button>
        <button className="btn-stop rounded-full px-6 py-3 text-sm sm:px-10 sm:text-base" disabled={!canStop || target !== null} onClick={handleStop}>
          PARAR
        </button>
      </div>
      <p className="mt-4 max-w-xs text-center text-xs leading-relaxed text-muted-foreground sm:max-w-sm">
        Você tem direito a um único giro. Clique em GIRAR para iniciar a roleta e, após alguns segundos, clique em PARAR para revelar seu prêmio. Boa sorte!
      </p>
    </main>
  );
}
