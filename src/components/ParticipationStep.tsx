import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, History, Search, Sparkles } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEntryByCpf } from "@/lib/wheel.functions";

type EntryInfo = {
  id: string;
  senha: string;
  nome: string;
  premio: string | null;
  spun: boolean;
  spun_at: string | null;
  vr_used: boolean;
};

type Props = {
  onFirstTime: () => void;
  onExistingFound: (entry: EntryInfo) => void;
};

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(cpf.slice(0, 9), 10) === Number(cpf[9])
    && calcDigit(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

export default function ParticipationStep({ onFirstTime, onExistingFound }: Props) {
  const fetchByCpf = useServerFn(getEntryByCpf);
  const [mode, setMode] = useState<"choice" | "returning">("choice");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidCpf(cpf)) {
      setError("Não localizamos esse CPF. Confira os números digitados ou volte para fazer um novo cadastro.");
      return;
    }

    setLoading(true);
    try {
      const row = await fetchByCpf({ data: { cpf } });
      if (!row) {
        setError("Não localizamos uma participação com esse CPF. Confira os números ou faça um novo cadastro.");
        return;
      }
      onExistingFound(row as EntryInfo);
    } catch {
      setError("Não foi possível consultar esse CPF agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl">
        <div className="p-8 sm:p-10 flex flex-col justify-between gap-10 bg-secondary/35">
          <div>
            <img src={logoUrl} alt="Findes IEL" className="h-14 mb-10" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Roleta de Prêmios
            </p>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              Antes de começar, conte como você chegou até aqui.
            </h1>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" />
              <span>Novos participantes preenchem o cadastro e giram a roleta.</span>
            </div>
            <div className="flex items-center gap-3">
              <History className="size-5 text-accent" />
              <span>Quem já participou pode consultar o resultado pelo CPF.</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {mode === "choice" ? (
            <div className="grid gap-4">
              <button
                type="button"
                onClick={onFirstTime}
                className="group text-left rounded-lg border border-primary/45 bg-primary/10 p-5 transition hover:border-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-lg font-bold">É minha primeira vez</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Quero preencher meus dados e participar da roleta.
                    </span>
                  </span>
                  <ArrowRight className="size-5 text-primary transition group-hover:translate-x-1" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("returning")}
                className="group text-left rounded-lg border border-border bg-muted/30 p-5 transition hover:border-accent hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-lg font-bold">Já participei</span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Quero informar meu CPF e ver o resultado do meu giro.
                    </span>
                  </span>
                  <Search className="size-5 text-accent transition group-hover:scale-105" />
                </span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleLookup} className="grid gap-5">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("choice");
                    setError(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Voltar
                </button>
                <h2 className="mt-5 text-2xl font-bold">Consultar participação</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Digite o CPF usado no cadastro para recuperar o resultado.
                </p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="cpf-lookup" className="text-sm font-semibold">
                  CPF
                </label>
                <Input
                  id="cpf-lookup"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  className="h-12 rounded-lg bg-background/50 text-base"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="h-12 rounded-lg btn-spin">
                {loading ? "Consultando..." : "Ver meu resultado"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
