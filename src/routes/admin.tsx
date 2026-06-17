import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Save, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEGMENT_COLORS } from "@/components/Wheel";
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
  const loadSettingsFn = useServerFn(adminGetFormSettings);
  const saveSettingsFn = useServerFn(adminSaveFormSettings);
  const [rows, setRows] = useState<EntryRow[]>([]);
  const [tab, setTab] = useState<"all" | "vr" | "wheel" | "form">("all");
  const [query, setQuery] = useState("");
  const [wheelLabels, setWheelLabels] = useState<string[]>([]);
  const [wheelMessage, setWheelMessage] = useState<string | null>(null);
  const [interestGroups, setInterestGroups] = useState<InterestGroup[]>(DEFAULT_INTEREST_GROUPS);
  const [formSettings, setFormSettings] = useState<FormSettings>(DEFAULT_FORM_SETTINGS);
  const [formMessage, setFormMessage] = useState<{ text: string; kind: "ok" | "error" } | null>(null);
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

  async function refreshFormSettings() {
    const data = await loadSettingsFn();
    setFormSettings(data as FormSettings);
  }

  useEffect(() => {
    void refresh();
    void refreshWheel();
    void refreshInterestOptions();
    void refreshFormSettings();
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
    <div className="min-h-screen w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:mx-auto">
      <header className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logoUrl} alt="Logo" className="h-10 shrink-0 sm:h-12" />
          <h1 className="min-w-0 text-xl font-bold leading-tight sm:text-2xl">Painel do Gestor</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="outline" className="h-10" onClick={() => void refresh()}>Atualizar</Button>
          <Button onClick={downloadReportCsv} className="h-10 btn-spin">Baixar CSV</Button>
          <Button variant="ghost" className="col-span-2 h-10 sm:col-span-1" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </div>
      </header>

      <div className="mb-4 grid gap-3 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
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
                O sorteio usa as pas salvas no banco. Cada pa cadastrada tem uma chance igual.
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
              <div key={`wheel-label-${index}`} className="grid gap-3 rounded-lg border border-border bg-muted/15 p-3 sm:grid-cols-[190px_1fr_auto] sm:items-center">
                <div className="flex items-center gap-3">
                  <span
                    className="h-11 w-11 shrink-0 rounded-full border border-white/20 shadow-inner"
                    style={{ background: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-black">Pa #{index + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(index * (360 / wheelLabels.length))} deg - {Math.round((index + 1) * (360 / wheelLabels.length))} deg
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
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
                  <p className="truncate text-xs text-muted-foreground">
                    Previa: {label || "Pa sem texto"}
                  </p>
                </div>
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
              <h2 className="text-lg font-bold">Formulário</h2>
              <p className="text-sm text-muted-foreground">
                Edite os textos, opções e grupos de interesse do cadastro. O CSV usa automaticamente esta lista.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInterestGroups((groups) => [...groups, { group: "Novo grupo", items: ["Nova opção"] }])}
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
                    setFormMessage({ text: "Cadastre pelo menos um grupo com uma opção.", kind: "error" });
                    return;
                  }
                  const sexoOptions = formSettings.sexoOptions
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (sexoOptions.length === 0) {
                    setFormMessage({ text: "Informe pelo menos uma opção em Sexo.", kind: "error" });
                    return;
                  }
                  const settingsPayload = {
                    title: formSettings.title.trim(),
                    subtitle: formSettings.subtitle.trim(),
                    term: formSettings.term.trim(),
                    submitLabel: formSettings.submitLabel.trim(),
                    sexoOptions,
                    empregadoSimLabel: formSettings.empregadoSimLabel.trim(),
                    empregadoNaoLabel: formSettings.empregadoNaoLabel.trim(),
                  };
                  try {
                    await saveInterestFn({ data: { groups } });
                    await refreshInterestOptions();
                    await saveSettingsFn({ data: settingsPayload });
                    await refreshFormSettings();
                    setFormMessage({ text: "Formulário salvo com sucesso.", kind: "ok" });
                  } catch (err) {
                    const message = (err as Error).message ?? "";
                    if (message.includes("form_settings") || message.includes("schema cache")) {
                      setFormMessage({
                        text: "Opcoes de interesse salvas. Para salvar textos gerais do formulario, execute a migration da tabela form_settings no Supabase.",
                        kind: "ok",
                      });
                      return;
                    }
                    setFormMessage({
                      text: `Erro ao salvar: ${message || "tente novamente"}`,
                      kind: "error",
                    });
                  }
                }}
              >
                <Save className="size-4" />
                Salvar
              </Button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-lg border border-border bg-muted/15 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Textos da página</h3>
            <div className="grid gap-2">
              <Label htmlFor="set-title">Título</Label>
              <Input
                id="set-title"
                value={formSettings.title}
                maxLength={200}
                onChange={(e) => setFormSettings({ ...formSettings, title: e.target.value })}
                className="h-11 rounded-lg bg-background/45"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="set-subtitle">Subtítulo</Label>
              <Input
                id="set-subtitle"
                value={formSettings.subtitle}
                maxLength={500}
                onChange={(e) => setFormSettings({ ...formSettings, subtitle: e.target.value })}
                className="h-11 rounded-lg bg-background/45"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="set-submit">Texto do botão de envio</Label>
              <Input
                id="set-submit"
                value={formSettings.submitLabel}
                maxLength={80}
                onChange={(e) => setFormSettings({ ...formSettings, submitLabel: e.target.value })}
                className="h-11 rounded-lg bg-background/45"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="set-term">Termo de aceite (LGPD)</Label>
              <textarea
                id="set-term"
                value={formSettings.term}
                maxLength={5000}
                onChange={(e) => setFormSettings({ ...formSettings, term: e.target.value })}
                rows={8}
                className="rounded-lg border border-border bg-background/45 p-3 text-sm leading-relaxed"
              />
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-lg border border-border bg-muted/15 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Opções de Sexo</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormSettings((s) => ({ ...s, sexoOptions: [...s.sexoOptions, "Nova opção"] }))}
              >
                <Plus className="size-4" /> Opção
              </Button>
            </div>
            <div className="grid gap-2">
              {formSettings.sexoOptions.map((opt, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    value={opt}
                    maxLength={80}
                    onChange={(e) => {
                      const next = [...formSettings.sexoOptions];
                      next[i] = e.target.value;
                      setFormSettings({ ...formSettings, sexoOptions: next });
                    }}
                    className="h-11 rounded-lg bg-background/45"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={formSettings.sexoOptions.length <= 1}
                    onClick={() =>
                      setFormSettings((s) => ({
                        ...s,
                        sexoOptions: s.sexoOptions.filter((_, idx) => idx !== i),
                      }))
                    }
                    aria-label="Remover opção"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-lg border border-border bg-muted/15 p-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="set-emp-sim">Rótulo "Está empregado" — SIM</Label>
              <Input
                id="set-emp-sim"
                value={formSettings.empregadoSimLabel}
                maxLength={40}
                onChange={(e) => setFormSettings({ ...formSettings, empregadoSimLabel: e.target.value })}
                className="h-11 rounded-lg bg-background/45"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="set-emp-nao">Rótulo "Está empregado" — NÃO</Label>
              <Input
                id="set-emp-nao"
                value={formSettings.empregadoNaoLabel}
                maxLength={40}
                onChange={(e) => setFormSettings({ ...formSettings, empregadoNaoLabel: e.target.value })}
                className="h-11 rounded-lg bg-background/45"
              />
            </div>
          </div>

          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Grupos de interesse</h3>
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
                        aria-label="Opção de interesse"
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
                        aria-label="Remover opção"
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
                    next[groupIndex] = { ...next[groupIndex], items: [...next[groupIndex].items, "Nova opção"] };
                    setInterestGroups(next);
                  }}
                >
                  <Plus className="size-4" />
                  Adicionar opção
                </Button>
              </div>
            ))}
          </div>

          {formMessage && (
            <p
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                formMessage.kind === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive-foreground"
                  : "border-primary/40 bg-primary/10 text-primary-foreground"
              }`}
            >
              {formMessage.text}
            </p>
          )}
        </section>
      ) : loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {filteredRows.map((r) => (
              <article key={r.id} className="rounded-lg border border-border bg-card p-4 shadow-lg">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold">{r.nome}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">CPF {formatCpf(r.cpf)}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-muted px-2 py-1 font-mono text-xs font-bold">
                    {r.senha}
                  </span>
                </div>

                <dl className="grid gap-2 text-sm">
                  <div className="grid gap-1">
                    <dt className="text-xs font-semibold uppercase text-muted-foreground">E-mail</dt>
                    <dd className="break-words">{r.email}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">Telefone</dt>
                      <dd>{r.telefone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">Girou</dt>
                      <dd>{r.spun ? "Sim" : "Não"}</dd>
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-xs font-semibold uppercase text-muted-foreground">Prêmio</dt>
                    <dd className="break-words">{r.premio ?? "-"}</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  {tab === "vr" ? (
                    <Button
                      size="sm"
                      className="w-full"
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
                      className="w-full"
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
                </div>
              </article>
            ))}
            {filteredRows.length === 0 && (
              <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Nenhum registro encontrado.
              </div>
            )}
          </div>

          <div className="hidden overflow-auto rounded-lg border border-border bg-card md:block">
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
        </>
      )}
    </div>
  );
}
