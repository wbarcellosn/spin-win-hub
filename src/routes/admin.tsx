import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminExists,
  adminGetFormSettings,
  adminIsAdmin,
  adminListInterestOptions,
  adminListEntries,
  adminListWheelPrizes,
  adminMarkVrUsed,
  adminResetSpin,
  adminSaveFormSettings,
  adminSaveInterestOptions,
  adminSaveWheelPrizes,
  bootstrapAdmin,
} from "@/lib/admin.functions";
import { DEFAULT_FORM_SETTINGS, DEFAULT_INTEREST_GROUPS, type FormSettings, type InterestGroup } from "@/lib/form-options";
import { isVrPrize } from "@/lib/prizes";
import logoUrl from "@/assets/logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Admin - Roleta IEL" }] }),
  component: AdminPage,
});

type EntryRow = {
  id: string;
  senha: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  sexo: string;
  empregado: boolean;
  empresa: string | null;
  interesses: string[];
  termo_aceite: boolean;
  filled_at: string;
  premio: string | null;
  spun: boolean;
  spun_at: string | null;
  vr_used: boolean;
  created_at: string;
};

function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function AdminPage() {
  const [session, setSession] = useState<unknown>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const checkAdmin = useServerFn(adminIsAdmin);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) {
        checkAdmin().then((r) => {
          setIsAdmin(r.isAdmin);
          setChecking(false);
        });
      } else {
        setIsAdmin(null);
        setChecking(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        checkAdmin().then((r) => {
          setIsAdmin(r.isAdmin);
          setChecking(false);
        });
      } else {
        setChecking(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [checkAdmin]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }
  if (!session) return <LoginForm />;
  if (!isAdmin) return <NotAuthorized />;
  return <Dashboard />;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"login" | "bootstrap">("login");
  const existsFn = useServerFn(adminExists);
  const bootstrapFn = useServerFn(bootstrapAdmin);

  useEffect(() => {
    existsFn().then((r) => {
      setHasAdmin(r.exists);
      if (!r.exists) setMode("bootstrap");
    });
  }, [existsFn]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === "bootstrap") {
      try {
        await bootstrapFn({ data: { email, password } });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } catch (err) {
        setError((err as Error).message);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <img src={logoUrl} alt="Logo" className="h-16 mb-6" />
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4 shadow-xl">
        <h1 className="text-xl font-bold text-center">
          {mode === "bootstrap" ? "Criar Conta Admin" : "Painel do Gestor"}
        </h1>
        {mode === "bootstrap" && (
          <p className="text-xs text-muted-foreground text-center">
            Nenhum administrador cadastrado. Crie a primeira conta para acessar o painel.
          </p>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button type="submit" disabled={loading || hasAdmin === null} className="w-full btn-spin">
          {loading ? "Aguarde..." : mode === "bootstrap" ? "Criar e Entrar" : "Entrar"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Acesso restrito a administradores autorizados.
        </p>
      </form>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-lg font-semibold">Acesso negado</p>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Sua conta não tem permissão de administrador.
      </p>
      <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>
    </div>
  );
}

function Dashboard() {
  const listFn = useServerFn(adminListEntries);
  const listWheelFn = useServerFn(adminListWheelPrizes);
  const listInterestFn = useServerFn(adminListInterestOptions);
  const markFn = useServerFn(adminMarkVrUsed);
  const resetFn = useServerFn(adminResetSpin);
  const saveWheelFn = useServerFn(adminSaveWheelPrizes);
  const saveInterestFn = useServerFn(adminSaveInterestOptions);
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [tab, setTab] = useState<"all" | "vr" | "wheel" | "form">("all");
  const [query, setQuery] = useState("");
  const [wheelLabels, setWheelLabels] = useState<string[]>([]);
  const [wheelMessage, setWheelMessage] = useState<string | null>(null);
  const [interestGroups, setInterestGroups] = useState<InterestGroup[]>(DEFAULT_INTEREST_GROUPS);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const data = await listFn();
    setRows(data as EntryRow[]);
    setLoading(false);
  }

  async function refreshWheel() {
    const data = await listWheelFn();
    setWheelLabels((data as Array<{ label: string }>).map((item) => item.label));
  }

  async function refreshInterestOptions() {
    const data = await listInterestFn();
    setInterestGroups(data as InterestGroup[]);
  }

  useEffect(() => {
    void refresh();
    void refreshWheel();
    void refreshInterestOptions();
  }, []); // eslint-disable-line

  const vrRows = rows.filter((r) => isVrPrize(r.premio));
  const interestLabels = useMemo(
    () => interestGroups.flatMap((group) => group.items).filter(Boolean),
    [interestGroups],
  );
  const activeRows = tab === "vr" ? vrRows : rows;
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeRows;
    const digits = q.replace(/\D/g, "");
    return activeRows.filter((r) => {
      const haystack = [r.senha, r.nome, r.email, r.telefone, r.cpf, r.premio ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q) || (digits.length > 0 && r.cpf.replace(/\D/g, "").includes(digits));
    });
  }, [activeRows, query]);

  function downloadCsv() {
    const headers = [
      "Senha", "Nome", "CPF", "Telefone", "Email", "Sexo", "Empregado", "Empresa",
      "Interesses", "Termo Aceite", "Preenchido em", "Prêmio", "Girou", "Girou em", "VR Utilizado", "Criado em"
    ];
    const lines = [headers.join(";")];
    for (const r of rows) {
      const row = [
        r.senha, r.nome, formatCpf(r.cpf), r.telefone, r.email, r.sexo,
        r.empregado ? "Sim" : "Não", r.empresa ?? "",
        (Array.isArray(r.interesses) ? r.interesses : []).join(" | "),
        r.termo_aceite ? "Sim" : "Não",
        r.filled_at, r.premio ?? "", r.spun ? "Sim" : "Não",
        r.spun_at ?? "", r.vr_used ? "Sim" : "Não", r.created_at,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(";"));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respostas-roleta-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadReportCsv() {
    const headers = [
      "Senha", "Nome", "CPF", "Telefone", "Email", "Sexo", "Empregado", "Empresa",
      ...interestLabels,
      "Termo Aceite", "Preenchido em", "Premio", "Girou", "Girou em", "VR Utilizado", "Criado em",
    ];
    const lines = [headers.join(";")];
    for (const r of rows) {
      const selectedInterests = new Set(Array.isArray(r.interesses) ? r.interesses : []);
      const row = [
        r.senha, r.nome, formatCpf(r.cpf), r.telefone, r.email, r.sexo,
        r.empregado ? "Sim" : "Nao", r.empresa ?? "",
        ...interestLabels.map((label) => selectedInterests.has(label) ? "SIM" : "NAO"),
        r.termo_aceite ? "Sim" : "Nao",
        r.filled_at, r.premio ?? "", r.spun ? "Sim" : "Nao",
        r.spun_at ?? "", r.vr_used ? "Sim" : "Nao", r.created_at,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(";"));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respostas-roleta-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-3 py-5 sm:px-4 sm:py-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Logo" className="h-10 sm:h-12" />
          <h1 className="text-xl font-bold sm:text-2xl">Painel do Gestor</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Button variant="outline" onClick={() => void refresh()}>Atualizar</Button>
          <Button onClick={downloadReportCsv} className="btn-spin">Baixar CSV</Button>
          <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </div>
      </header>

      <div className="mb-4 grid gap-3 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex gap-2 overflow-x-auto">
          <button
            className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            onClick={() => setTab("all")}
          >
            Todas as respostas ({rows.length})
          </button>
          <button
            className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "vr" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            onClick={() => setTab("vr")}
          >
            Senhas VR ({vrRows.length})
          </button>
          <button
            className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "wheel" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            onClick={() => setTab("wheel")}
          >
            Pás da roleta
          </button>
          <button
            className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "form" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            onClick={() => setTab("form")}
          >
            Formulario
          </button>
        </div>

        {(tab === "all" || tab === "vr") && (
          <div className="relative lg:ml-auto lg:w-[360px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, CPF, e-mail..."
              className="h-10 rounded-lg bg-card pl-9"
            />
          </div>
        )}
      </div>

      {tab === "wheel" ? (
        <section className="rounded-lg border border-border bg-card p-4 shadow-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Pás da roleta</h2>
              <p className="text-sm text-muted-foreground">
                O sorteio é uniforme entre todos os itens cadastrados abaixo.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setWheelLabels((labels) => [...labels, "NOVO PRÊMIO"])}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
              <Button
                type="button"
                className="btn-spin"
                onClick={async () => {
                  setWheelMessage(null);
                  const labels = wheelLabels.map((label) => label.trim()).filter(Boolean);
                  if (labels.length < 2) {
                    setWheelMessage("Cadastre pelo menos duas pás.");
                    return;
                  }
                  await saveWheelFn({ data: { labels } });
                  await refreshWheel();
                  setWheelMessage("Pás da roleta salvas.");
                }}
              >
                <Save className="size-4" />
                Salvar
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {wheelLabels.map((label, index) => (
              <div key={`${index}-${label}`} className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <span className="text-sm font-mono text-muted-foreground">#{index + 1}</span>
                <Input
                  value={label}
                  maxLength={80}
                  onChange={(e) => {
                    const next = [...wheelLabels];
                    next[index] = e.target.value;
                    setWheelLabels(next);
                  }}
                  className="h-11 rounded-lg bg-background/45"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={wheelLabels.length <= 2}
                  onClick={() => setWheelLabels((labels) => labels.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label="Remover pá"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {wheelMessage && <p className="mt-4 text-sm text-muted-foreground">{wheelMessage}</p>}
        </section>
      ) : tab === "form" ? (
        <section className="rounded-lg border border-border bg-card p-4 shadow-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Formulario</h2>
              <p className="text-sm text-muted-foreground">
                Edite os grupos e opcoes de interesse exibidos no cadastro. O CSV usa automaticamente esta lista.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInterestGroups((groups) => [...groups, { group: "Novo grupo", items: ["Nova opcao"] }])}
              >
                <Plus className="size-4" />
                Grupo
              </Button>
              <Button
                type="button"
                className="btn-spin"
                onClick={async () => {
                  setFormMessage(null);
                  const groups = interestGroups
                    .map((group) => ({
                      group: group.group.trim(),
                      items: group.items.map((item) => item.trim()).filter(Boolean),
                    }))
                    .filter((group) => group.group && group.items.length > 0);
                  if (groups.length === 0) {
                    setFormMessage("Cadastre pelo menos um grupo com uma opcao.");
                    return;
                  }
                  await saveInterestFn({ data: { groups } });
                  await refreshInterestOptions();
                  setFormMessage("Formulario salvo.");
                }}
              >
                <Save className="size-4" />
                Salvar
              </Button>
            </div>
          </div>

          <div className="grid gap-5">
            {interestGroups.map((group, groupIndex) => (
              <div key={`${groupIndex}-${group.group}`} className="rounded-lg border border-border bg-muted/15 p-4">
                <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={group.group}
                    maxLength={80}
                    onChange={(e) => {
                      const next = [...interestGroups];
                      next[groupIndex] = { ...next[groupIndex], group: e.target.value };
                      setInterestGroups(next);
                    }}
                    className="h-11 rounded-lg bg-background/45 font-semibold"
                    aria-label="Nome do grupo"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={interestGroups.length <= 1}
                    onClick={() => setInterestGroups((groups) => groups.filter((_, index) => index !== groupIndex))}
                    aria-label="Remover grupo"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={`${groupIndex}-${itemIndex}`} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Input
                        value={item}
                        maxLength={200}
                        onChange={(e) => {
                          const next = [...interestGroups];
                          const items = [...next[groupIndex].items];
                          items[itemIndex] = e.target.value;
                          next[groupIndex] = { ...next[groupIndex], items };
                          setInterestGroups(next);
                        }}
                        className="h-11 rounded-lg bg-background/45"
                        aria-label="Opcao de interesse"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={group.items.length <= 1}
                        onClick={() => {
                          const next = [...interestGroups];
                          next[groupIndex] = {
                            ...next[groupIndex],
                            items: next[groupIndex].items.filter((_, index) => index !== itemIndex),
                          };
                          setInterestGroups(next);
                        }}
                        aria-label="Remover opcao"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    const next = [...interestGroups];
                    next[groupIndex] = { ...next[groupIndex], items: [...next[groupIndex].items, "Nova opcao"] };
                    setInterestGroups(next);
                  }}
                >
                  <Plus className="size-4" />
                  Adicionar opcao
                </Button>
              </div>
            ))}
          </div>

          {formMessage && <p className="mt-4 text-sm text-muted-foreground">{formMessage}</p>}
        </section>
      ) : loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="overflow-auto rounded-lg border border-border bg-card">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Senha</th>
                <th className="p-2">Nome</th>
                <th className="p-2">CPF</th>
                <th className="p-2">Email</th>
                <th className="p-2">Telefone</th>
                <th className="p-2">Prêmio</th>
                <th className="p-2">Girou</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-2 font-mono">{r.senha}</td>
                  <td className="p-2">{r.nome}</td>
                  <td className="p-2 font-mono text-xs">{formatCpf(r.cpf)}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.telefone}</td>
                  <td className="p-2 text-xs">{r.premio ?? "-"}</td>
                  <td className="p-2">{r.spun ? "Sim" : "Não"}</td>
                  <td className="p-2">
                    {tab === "vr" ? (
                      <Button
                        size="sm"
                        variant={r.vr_used ? "ghost" : "default"}
                        onClick={async () => {
                          await markFn({ data: { id: r.id, used: !r.vr_used } });
                          await refresh();
                        }}
                      >
                        {r.vr_used ? "Utilizada" : "Não utilizada"}
                      </Button>
                    ) : r.spun ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (confirm("Liberar nova rodada para este usuário?")) {
                            await resetFn({ data: { id: r.id } });
                            await refresh();
                          }
                        }}
                      >
                        Liberar giro
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={8}>
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
