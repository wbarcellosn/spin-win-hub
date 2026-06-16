import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn, l as logoUrl, L as Label, I as Input, B as Button, i as isVrPrize, c as createSsrRpc } from "./logo-D-JLJz2p.mjs";
import { s as supabase } from "./client-CNKJVOI5.mjs";
import { a as createServerFn } from "./server-gJkfgEhg.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-D1uD3tV3.mjs";
import "../_libs/seroval.mjs";
import { S as Search, P as Plus, a as Save, T as Trash2 } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, b as booleanType, a as arrayType } from "../_libs/zod.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const adminListEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("91701904c4a88c998a107866d8807127df76cc1972c1e81307f1eaadfb29db74"));
const adminMarkVrUsed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  used: booleanType()
}).parse(d)).handler(createSsrRpc("87570d6a0d7691dda0076084293ef336b17911fe92d43e09e9a67ee737cba380"));
const adminResetSpin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("62a09630ae892efc99d847cbb74d9a2e477d75d16edda2abe1140389189deccf"));
const adminListWheelPrizes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("1d5154eba6fa00ac95e815449ea093f347b48563c33bbbb067ece453f3b9060b"));
const adminSaveWheelPrizes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  labels: arrayType(stringType().trim().min(1).max(80)).min(2).max(16)
}).parse(d)).handler(createSsrRpc("ee833e4f45be3fcc98c6b8a8c97b04e32f93e9bf81c1f77fad047726ba34e147"));
const adminIsAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("8110b640fbabe7b99a6b84747433f9bf498ae415f0f4b203e0076410d9c92c27"));
const adminExists = createServerFn({
  method: "GET"
}).handler(createSsrRpc("8b404eadc272d7d27f48745f2fd105c6bc74772c80d7e5eb87638d43cd197daa"));
const bootstrapAdmin = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(255),
  password: stringType().min(8).max(128)
}).parse(d)).handler(createSsrRpc("8b5e87060261a59e92bcd5e92ce4cf6afa0ee8e3737aa66e7c16f0be951897c6"));
function formatCpf(cpf) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
function AdminPage() {
  const [session, setSession] = reactExports.useState(null);
  const [isAdmin, setIsAdmin] = reactExports.useState(null);
  const [checking, setChecking] = reactExports.useState(true);
  const checkAdmin = useServerFn(adminIsAdmin);
  reactExports.useEffect(() => {
    const {
      data: sub
    } = supabase.auth.onAuthStateChange((_e, s) => {
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
    supabase.auth.getSession().then(({
      data
    }) => {
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground", children: "Carregando..." });
  }
  if (!session) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoginForm, {});
  if (!isAdmin) return /* @__PURE__ */ jsxRuntimeExports.jsx(NotAuthorized, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, {});
}
function LoginForm() {
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [hasAdmin, setHasAdmin] = reactExports.useState(null);
  const [mode, setMode] = reactExports.useState("login");
  const existsFn = useServerFn(adminExists);
  const bootstrapFn = useServerFn(bootstrapAdmin);
  reactExports.useEffect(() => {
    existsFn().then((r) => {
      setHasAdmin(r.exists);
      if (!r.exists) setMode("bootstrap");
    });
  }, [existsFn]);
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === "bootstrap") {
      try {
        await bootstrapFn({
          data: {
            email,
            password
          }
        });
        const {
          error: error2
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error2) setError(error2.message);
      } catch (err) {
        setError(err.message);
      }
    } else {
      const {
        error: error2
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error2) setError(error2.message);
    }
    setLoading(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Logo", className: "h-16 mb-6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogin, className: "w-full max-w-sm bg-card border border-border rounded-lg p-6 space-y-4 shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-center", children: mode === "bootstrap" ? "Criar Conta Admin" : "Painel do Gestor" }),
      mode === "bootstrap" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Nenhum administrador cadastrado. Crie a primeira conta para acessar o painel." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "E-mail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 8 })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive text-sm", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading || hasAdmin === null, className: "w-full btn-spin", children: loading ? "Aguarde..." : mode === "bootstrap" ? "Criar e Entrar" : "Entrar" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Acesso restrito a administradores autorizados." })
    ] })
  ] });
}
function NotAuthorized() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center gap-4 px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: "Acesso negado" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center max-w-sm", children: "Sua conta não tem permissão de administrador." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => supabase.auth.signOut(), children: "Sair" })
  ] });
}
function Dashboard() {
  const listFn = useServerFn(adminListEntries);
  const listWheelFn = useServerFn(adminListWheelPrizes);
  const markFn = useServerFn(adminMarkVrUsed);
  const resetFn = useServerFn(adminResetSpin);
  const saveWheelFn = useServerFn(adminSaveWheelPrizes);
  const [rows, setRows] = reactExports.useState([]);
  const [tab, setTab] = reactExports.useState("all");
  const [query, setQuery] = reactExports.useState("");
  const [wheelLabels, setWheelLabels] = reactExports.useState([]);
  const [wheelMessage, setWheelMessage] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  async function refresh() {
    setLoading(true);
    const data = await listFn();
    setRows(data);
    setLoading(false);
  }
  async function refreshWheel() {
    const data = await listWheelFn();
    setWheelLabels(data.map((item) => item.label));
  }
  reactExports.useEffect(() => {
    void refresh();
    void refreshWheel();
  }, []);
  const vrRows = rows.filter((r) => isVrPrize(r.premio));
  const activeRows = tab === "vr" ? vrRows : rows;
  const filteredRows = reactExports.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeRows;
    const digits = q.replace(/\D/g, "");
    return activeRows.filter((r) => {
      const haystack = [r.senha, r.nome, r.email, r.telefone, r.cpf, r.premio ?? ""].join(" ").toLowerCase();
      return haystack.includes(q) || digits.length > 0 && r.cpf.replace(/\D/g, "").includes(digits);
    });
  }, [activeRows, query]);
  function downloadCsv() {
    const headers = ["Senha", "Nome", "CPF", "Telefone", "Email", "Sexo", "Empregado", "Empresa", "Interesses", "Termo Aceite", "Preenchido em", "Prêmio", "Girou", "Girou em", "VR Utilizado", "Criado em"];
    const lines = [headers.join(";")];
    for (const r of rows) {
      const row = [r.senha, r.nome, formatCpf(r.cpf), r.telefone, r.email, r.sexo, r.empregado ? "Sim" : "Não", r.empresa ?? "", (Array.isArray(r.interesses) ? r.interesses : []).join(" | "), r.termo_aceite ? "Sim" : "Não", r.filled_at, r.premio ?? "", r.spun ? "Sim" : "Não", r.spun_at ?? "", r.vr_used ? "Sim" : "Não", r.created_at].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(row.join(";"));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `respostas-roleta-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen px-3 py-5 sm:px-4 sm:py-8 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Logo", className: "h-10 sm:h-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold sm:text-2xl", children: "Painel do Gestor" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 sm:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => void refresh(), children: "Atualizar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: downloadCsv, className: "btn-spin", children: "Baixar CSV" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => supabase.auth.signOut(), children: "Sair" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 grid gap-3 lg:grid-cols-[auto_1fr] lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 overflow-x-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`, onClick: () => setTab("all"), children: [
          "Todas as respostas (",
          rows.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: `shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "vr" ? "bg-primary text-primary-foreground" : "bg-muted"}`, onClick: () => setTab("vr"), children: [
          "Senhas VR (",
          vrRows.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: `shrink-0 px-4 py-2 rounded-md text-sm font-medium ${tab === "wheel" ? "bg-primary text-primary-foreground" : "bg-muted"}`, onClick: () => setTab("wheel"), children: "Pás da roleta" })
      ] }),
      tab !== "wheel" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative lg:ml-auto lg:w-[360px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Buscar por nome, CPF, e-mail...", className: "h-10 rounded-lg bg-card pl-9" })
      ] })
    ] }),
    tab === "wheel" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-lg border border-border bg-card p-4 shadow-xl sm:p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Pás da roleta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "O sorteio é uniforme entre todos os itens cadastrados abaixo." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: () => setWheelLabels((labels) => [...labels, "NOVO PRÊMIO"]), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
            "Adicionar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "btn-spin", onClick: async () => {
            setWheelMessage(null);
            const labels = wheelLabels.map((label) => label.trim()).filter(Boolean);
            if (labels.length < 2) {
              setWheelMessage("Cadastre pelo menos duas pás.");
              return;
            }
            await saveWheelFn({
              data: {
                labels
              }
            });
            await refreshWheel();
            setWheelMessage("Pás da roleta salvas.");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
            "Salvar"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: wheelLabels.map((label, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-mono text-muted-foreground", children: [
          "#",
          index + 1
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: label, maxLength: 80, onChange: (e) => {
          const next = [...wheelLabels];
          next[index] = e.target.value;
          setWheelLabels(next);
        }, className: "h-11 rounded-lg bg-background/45" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", disabled: wheelLabels.length <= 2, onClick: () => setWheelLabels((labels) => labels.filter((_, itemIndex) => itemIndex !== index)), "aria-label": "Remover pá", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
      ] }, `${index}-${label}`)) }),
      wheelMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: wheelMessage })
    ] }) : loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Carregando..." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto rounded-lg border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-[980px] w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Senha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Nome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "CPF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Telefone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Prêmio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Girou" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2", children: "Ações" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filteredRows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 font-mono", children: r.senha }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: r.nome }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 font-mono text-xs", children: formatCpf(r.cpf) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: r.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: r.telefone }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-xs", children: r.premio ?? "-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: r.spun ? "Sim" : "Não" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: tab === "vr" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: r.vr_used ? "ghost" : "default", onClick: async () => {
            await markFn({
              data: {
                id: r.id,
                used: !r.vr_used
              }
            });
            await refresh();
          }, children: r.vr_used ? "Utilizada" : "Não utilizada" }) : r.spun ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: async () => {
            if (confirm("Liberar nova rodada para este usuário?")) {
              await resetFn({
                data: {
                  id: r.id
                }
              });
              await refresh();
            }
          }, children: "Liberar giro" }) : null })
        ] }, r.id)),
        filteredRows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-6 text-center text-muted-foreground", colSpan: 8, children: "Nenhum registro encontrado." }) })
      ] })
    ] }) })
  ] });
}
export {
  AdminPage as component
};
