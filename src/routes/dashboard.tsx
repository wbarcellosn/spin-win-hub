import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { adminGetDashboardStats, adminIsAdmin } from "@/lib/admin.functions";
import logoUrl from "@/assets/logo.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - Roleta IEL" }] }),
  component: DashboardPage,
});

type Bucket = {
  label: string;
  count: number;
  percent: number;
};

type DashboardStats = {
  totalParticipants: number;
  genders: Bucket[];
  employment: Bucket[];
  prizes: Bucket[];
  interests: Bucket[];
  organizations: {
    total: number;
    percent: number;
    items: Bucket[];
  };
};

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function StatCard({ title, value, detail }: { title: string; value: string | number; detail?: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-lg sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-black leading-none sm:text-4xl">{value}</p>
      {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}
    </section>
  );
}

function DistributionCard({ title, items, empty = "Sem dados" }: { title: string; items: Bucket[]; empty?: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-lg sm:p-5">
      <h2 className="text-base font-bold sm:text-lg">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="grid gap-1.5">
              <div className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 break-words font-medium">{item.label}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {item.count} | {formatPercent(item.percent)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <img src={logoUrl} alt="Findes IEL" className="mb-6 h-14" />
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6 shadow-xl">
        <div className="text-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre com seu login de administrador para visualizar os indicadores.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dashboard-email">E-mail</Label>
          <Input
            id="dashboard-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dashboard-password">Senha</Label>
          <Input
            id="dashboard-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full btn-spin">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </main>
  );
}

function Gate({ title, text }: { title: string; text: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <img src={logoUrl} alt="Findes IEL" className="mb-6 h-14" />
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{text}</p>
      <a href="/admin" className="mt-5">
        <Button variant="outline">Ir para o admin</Button>
      </a>
    </main>
  );
}

function DashboardPage() {
  const checkAdmin = useServerFn(adminIsAdmin);
  const loadStats = useServerFn(adminGetDashboardStats);
  const [session, setSession] = useState<unknown>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshStats() {
    setLoadingStats(true);
    setError(null);
    try {
      const data = await loadStats();
      setStats(data as DashboardStats);
    } catch (err) {
      setError((err as Error).message || "Nao foi possivel carregar o dashboard.");
    } finally {
      setLoadingStats(false);
    }
  }

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

  useEffect(() => {
    if (session && isAdmin) void refreshStats();
  }, [session, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  }
  if (!session) {
    return <DashboardLogin />;
  }
  if (!isAdmin) {
    return <Gate title="Acesso negado" text="Sua conta nao tem permissao para visualizar este dashboard." />;
  }

  return (
    <main className="min-h-screen w-full max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:mx-auto">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img src={logoUrl} alt="Findes IEL" className="h-10 shrink-0 sm:h-12" />
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight sm:text-2xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Resumo dos participantes e resultados da roleta</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <a href="/admin">
            <Button variant="outline" className="h-10 w-full sm:w-auto">
              <ArrowLeft className="size-4" />
              Admin
            </Button>
          </a>
          <Button className="h-10" onClick={() => void refreshStats()} disabled={loadingStats}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
          <Button
            variant="ghost"
            className="col-span-2 h-10 sm:col-span-1"
            onClick={() => supabase.auth.signOut()}
          >
            Sair
          </Button>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {!stats ? (
        <p className="text-muted-foreground">{loadingStats ? "Carregando dashboard..." : "Sem dados para exibir."}</p>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total de participantes" value={stats.totalParticipants} />
            <StatCard
              title="SESI, SENAI ou FINDES"
              value={stats.organizations.total}
              detail={`${formatPercent(stats.organizations.percent)} do total`}
            />
            <StatCard
              title="Pessoas empregadas"
              value={stats.employment.find((item) => item.label === "Empregadas")?.count ?? 0}
              detail={formatPercent(stats.employment.find((item) => item.label === "Empregadas")?.percent ?? 0)}
            />
            <StatCard
              title="Pessoas desempregadas"
              value={stats.employment.find((item) => item.label === "Desempregadas")?.count ?? 0}
              detail={formatPercent(stats.employment.find((item) => item.label === "Desempregadas")?.percent ?? 0)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DistributionCard title="Genero" items={stats.genders} />
            <DistributionCard title="Empregadas x desempregadas" items={stats.employment} />
            <DistributionCard title="Premios e resultados" items={stats.prizes} />
            <DistributionCard title="SESI, SENAI e FINDES" items={stats.organizations.items} />
          </div>

          <DistributionCard title="Interesses marcados" items={stats.interests} />
        </div>
      )}
    </main>
  );
}
