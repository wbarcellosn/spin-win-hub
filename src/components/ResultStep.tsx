import { Home } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { isVrPrize } from "@/lib/prizes";

type Props = {
  prize: string;
  senha?: string;
  date?: string;
  onBackHome?: () => void;
};

export default function ResultStep({ prize, senha, date, onBackHome }: Props) {
  const isVR = isVrPrize(prize);
  const isWin = prize !== "NÃO FOI DESSA VEZ";
  const formatted = date ? new Date(date).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <img src={logoUrl} alt="Findes IEL" className="h-16 mb-6" />

      <section className="w-full max-w-md rounded-lg border border-border bg-card p-7 text-center shadow-2xl">
        <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
          {isWin ? "Parabéns!" : "Resultado"}
        </p>
        <h1
          className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{ color: isWin ? "var(--wheel-teal)" : "var(--foreground)" }}
        >
          {prize}
        </h1>

        {isVR && senha && (
          <div className="my-6 rounded-lg border border-accent/40 bg-accent/20 p-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
              Sua senha para retirar a experiência VR
            </p>
            <p className="text-5xl font-black tracking-[0.3em] text-accent">{senha}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Apresente esta senha no balcão do evento.
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">{formatted}</p>

        {onBackHome && (
          <Button type="button" variant="outline" onClick={onBackHome} className="mt-6 w-full rounded-lg">
            <Home className="size-4" />
            Voltar ao início
          </Button>
        )}
      </section>
    </main>
  );
}
