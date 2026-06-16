import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ParticipationStep from "@/components/ParticipationStep";
import FormStep from "@/components/FormStep";
import WheelStep from "@/components/WheelStep";
import ResultStep from "@/components/ResultStep";
import { getEntry } from "@/lib/wheel.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roleta Findes IEL" },
      { name: "description", content: "Cadastre-se, gire a roleta e concorra a prêmios." },
    ],
  }),
  component: Index,
});

const STORAGE_KEY = "iel_entry_id";

type EntryInfo = {
  id: string;
  senha: string;
  nome?: string;
  premio: string | null;
  spun: boolean;
  spun_at: string | null;
  vr_used?: boolean;
} | null;

function Index() {
  const fetchEntry = useServerFn(getEntry);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<EntryInfo>(null);
  const [view, setView] = useState<"intro" | "form" | "wheel" | "result">("intro");

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!id) {
      setLoading(false);
      return;
    }

    fetchEntry({ data: { id } })
      .then((row) => {
        if (!row) {
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }
        const e = row as EntryInfo;
        setEntry(e);
        setView(e?.spun ? "result" : "wheel");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fetchEntry]);

  function handleFirstTime() {
    localStorage.removeItem(STORAGE_KEY);
    setEntry(null);
    setView("form");
  }

  function handleExistingFound(found: NonNullable<EntryInfo>) {
    localStorage.setItem(STORAGE_KEY, found.id);
    setEntry(found);
    setView(found.spun ? "result" : "wheel");
  }

  function handleFormSubmitted(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
    fetchEntry({ data: { id } }).then((row) => {
      setEntry(row as EntryInfo);
      setView("wheel");
    });
  }

  function handleResult(prize: string) {
    if (entry) {
      setEntry({ ...entry, premio: prize, spun: true, spun_at: new Date().toISOString() });
    }
    setView("result");
  }

  function handleBackHome() {
    localStorage.removeItem(STORAGE_KEY);
    setEntry(null);
    setView("intro");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (view === "intro") {
    return <ParticipationStep onFirstTime={handleFirstTime} onExistingFound={handleExistingFound} />;
  }

  if (view === "form" || !entry) {
    return <FormStep onSubmitted={handleFormSubmitted} onBack={() => setView("intro")} />;
  }

  if (view === "wheel") {
    return <WheelStep entryId={entry.id} initialPrize={entry.premio} onResult={handleResult} />;
  }

  return (
    <ResultStep
      prize={entry.premio ?? ""}
      senha={entry.senha}
      vrUsed={!!entry.vr_used}
      date={entry.spun_at ?? undefined}
      onBackHome={handleBackHome}
    />
  );
}
