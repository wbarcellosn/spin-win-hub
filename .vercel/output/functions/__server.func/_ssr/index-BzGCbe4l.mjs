import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn, l as logoUrl, I as Input, B as Button, L as Label, i as isVrPrize, c as createSsrRpc, a as cn } from "./logo-D-JLJz2p.mjs";
import { a as createServerFn } from "./server-gJkfgEhg.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "../_libs/radix-ui__react-checkbox.mjs";
import { R as RadioGroup$1, a as RadioGroupItem$1, b as RadioGroupIndicator } from "../_libs/radix-ui__react-radio-group.mjs";
import "../_libs/seroval.mjs";
import { b as Sparkles, H as History, A as ArrowRight, S as Search, U as User, c as Phone, M as Mail, I as IdCard, B as BriefcaseBusiness, d as ShieldCheck, C as CircleCheck, e as House, f as Circle, g as Check } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, l as literalType, a as arrayType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
const submitSchema = objectType({
  nome: stringType().trim().min(1).max(200),
  telefone: stringType().trim().min(1).max(40),
  email: stringType().trim().email().max(255),
  cpf: stringType().trim().refine(isValidCpf$2, "CPF inválido"),
  sexo: enumType(["Masculino", "Feminino", "Prefiro não informar"]),
  empregado: booleanType(),
  empresa: stringType().trim().max(200).optional().nullable(),
  interesses: arrayType(stringType().min(1).max(200)).min(1).max(20),
  termo_aceite: literalType(true)
});
const cpfSchema = objectType({
  cpf: stringType().trim().refine(isValidCpf$2, "CPF inválido")
});
function isValidCpf$2(value) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calcDigit = (base, factor) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }
    const rest = total * 10 % 11;
    return rest === 10 ? 0 : rest;
  };
  const digit1 = calcDigit(cpf.slice(0, 9), 10);
  const digit2 = calcDigit(cpf.slice(0, 10), 11);
  return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10]);
}
const getWheelPrizes = createServerFn({
  method: "GET"
}).handler(createSsrRpc("a0184961e7d75500479c7fa26bae229ea863e37aaab3dbe9d93e7d57038a20b9"));
const submitForm = createServerFn({
  method: "POST"
}).inputValidator((d) => submitSchema.parse(d)).handler(createSsrRpc("aec28097a9b8c76b2cdefd0afd6e15475526a298afcf7e8bf06de95eb9770d84"));
const getEntry = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f2a46cde8c4c87131db02fddf9f22b85b49c65c55c3dd48fe73360a61fa91916"));
const getEntryByCpf = createServerFn({
  method: "POST"
}).inputValidator((d) => cpfSchema.parse(d)).handler(createSsrRpc("44954dc1e88408f4a289504814e6c703f0e8f510cdcd42f5cb9d4e396e5bae44"));
const recordSpin = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b0732aed35a213098fc32a2935a5f408e321083ddd7f0ca0c6f4c128ad0eb973"));
function isValidCpf$1(value) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calcDigit = (base, factor) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }
    const rest = total * 10 % 11;
    return rest === 10 ? 0 : rest;
  };
  return calcDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) && calcDigit(cpf.slice(0, 10), 11) === Number(cpf[10]);
}
function maskCPF$1(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}
function ParticipationStep({ onFirstTime, onExistingFound }) {
  const fetchByCpf = useServerFn(getEntryByCpf);
  const [mode, setMode] = reactExports.useState("choice");
  const [cpf, setCpf] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    if (!isValidCpf$1(cpf)) {
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
      onExistingFound(row);
    } catch {
      setError("Não foi possível consultar esse CPF agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen flex items-center justify-center px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 sm:p-10 flex flex-col justify-between gap-10 bg-secondary/35", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Findes IEL", className: "h-14 mb-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3", children: "Roleta de Prêmios" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-black leading-tight", children: "Antes de começar, conte como você chegou até aqui." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Novos participantes preenchem o cadastro e giram a roleta." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "size-5 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Quem já participou pode consultar o resultado pelo CPF." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 sm:p-10", children: mode === "choice" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onFirstTime,
          className: "group text-left rounded-lg border border-primary/45 bg-primary/10 p-5 transition hover:border-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-lg font-bold", children: "É minha primeira vez" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-sm text-muted-foreground", children: "Quero preencher meus dados e participar da roleta." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-5 text-primary transition group-hover:translate-x-1" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setMode("returning"),
          className: "group text-left rounded-lg border border-border bg-muted/30 p-5 transition hover:border-accent hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-lg font-bold", children: "Já participei" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-sm text-muted-foreground", children: "Quero informar meu CPF e ver o resultado do meu giro." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5 text-accent transition group-hover:scale-105" })
          ] })
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLookup, className: "grid gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setMode("choice");
              setError(null);
            },
            className: "text-sm text-muted-foreground hover:text-foreground",
            children: "Voltar"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-2xl font-bold", children: "Consultar participação" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Digite o CPF usado no cadastro para recuperar o resultado." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "cpf-lookup", className: "text-sm font-semibold", children: "CPF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "cpf-lookup",
            inputMode: "numeric",
            autoComplete: "off",
            placeholder: "000.000.000-00",
            value: cpf,
            onChange: (e) => setCpf(maskCPF$1(e.target.value)),
            className: "h-12 rounded-lg bg-background/50 text-base"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "h-12 rounded-lg btn-spin", children: loading ? "Consultando..." : "Ver meu resultado" })
    ] }) })
  ] }) });
}
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
const RadioGroup = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup$1, { className: cn("grid gap-2", className), ...props, ref });
});
RadioGroup.displayName = RadioGroup$1.displayName;
const RadioGroupItem = reactExports.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RadioGroupItem$1,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupIndicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5 fill-primary" }) })
    }
  );
});
RadioGroupItem.displayName = RadioGroupItem$1.displayName;
const TERM = `Declaro que concordo com a utilização dos dados pessoais por parte do IEL-ES para fins de avaliação de perfil profissional, participação em processos seletivos, divulgação de oportunidades profissionais, cursos, programas, eventos e demais iniciativas institucionais, bem como para a realização de pesquisas e levantamentos de interesse institucional.

Os dados pessoais informados serão tratados com segurança, confidencialidade e em conformidade com a Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018), observando-se os princípios da finalidade, adequação, necessidade e proteção dos direitos dos titulares dos dados.`;
const INTERESSES_GROUPS = [
  {
    group: "Estágios e carreira",
    items: [
      "Sou empresa, quero contratar estagiário e/ou CLT",
      "Oportunidade de emprego/estágio",
      "Gestão de estágio"
    ]
  },
  {
    group: "Academia Findes de Negócios",
    items: ["Cursos e eventos da Academia Findes de Negócios", "Fórum IEL de Gestão 2026"]
  }
];
const schema = objectType({
  nome: stringType().trim().min(1, "Informe seu nome").max(200),
  telefone: stringType().trim().min(8, "Telefone inválido").max(40),
  email: stringType().trim().email("E-mail inválido").max(255),
  cpf: stringType().trim().refine(isValidCpf, "CPF inválido"),
  sexo: enumType(["Masculino", "Feminino", "Prefiro não informar"]),
  empregado: booleanType(),
  empresa: stringType().trim().max(200).optional(),
  interesses: arrayType(stringType()).min(1, "Selecione ao menos um interesse"),
  termo_aceite: literalType(true, { errorMap: () => ({ message: "É necessário aceitar o termo" }) })
});
function isValidCpf(value) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calcDigit = (base, factor) => {
    let total = 0;
    for (const digit of base) {
      total += Number(digit) * factor;
      factor -= 1;
    }
    const rest = total * 10 % 11;
    return rest === 10 ? 0 : rest;
  };
  return calcDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) && calcDigit(cpf.slice(0, 10), 11) === Number(cpf[10]);
}
function maskCPF(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}
function maskPhone(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}
function FormStep({ onSubmitted, onBack }) {
  const submit = useServerFn(submitForm);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    sexo: "",
    empregado: null,
    empresa: "",
    interesses: [],
    termo_aceite: false
  });
  function toggleInterest(item) {
    setForm((f) => ({
      ...f,
      interesses: f.interesses.includes(item) ? f.interesses.filter((x) => x !== item) : [...f.interesses, item]
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({
      ...form,
      sexo: form.sexo || void 0,
      empregado: form.empregado ?? void 0
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifique os campos destacados.");
      return;
    }
    setLoading(true);
    try {
      const res = await submit({
        data: {
          ...parsed.data,
          empresa: parsed.data.empregado ? parsed.data.empresa ?? "" : null
        }
      });
      onSubmitted(res.id);
    } catch (err) {
      const msg = err.message;
      if (msg === "DUPLICATE_CPF" || msg.includes("DUPLICATE_CPF")) {
        setError("Este CPF já participou. Volte e escolha “Já participei” para consultar o resultado.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-screen px-3 py-5 sm:px-4 sm:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-5xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Findes IEL", className: "mb-4 h-12 sm:mb-5 sm:h-14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-black tracking-tight sm:text-3xl", children: "Cadastro para a Roleta" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground", children: "Preencha seus dados com atenção. O CPF será usado para validar uma única participação." })
      ] }),
      onBack && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onBack, className: "h-10 rounded-lg sm:w-auto", children: "Voltar" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit, className: "rounded-lg border border-border bg-card/85 p-4 shadow-2xl sm:p-7", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 sm:gap-7", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold sm:text-lg", children: "Dados pessoais" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "nome", children: "Nome *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "nome", value: form.nome, onChange: (e) => setForm({ ...form, nome: e.target.value }), className: "h-11 rounded-lg bg-background/45" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "telefone", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4 text-muted-foreground" }),
              " Telefone *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "telefone", inputMode: "tel", value: form.telefone, onChange: (e) => setForm({ ...form, telefone: maskPhone(e.target.value) }), className: "h-11 rounded-lg bg-background/45" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "email", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4 text-muted-foreground" }),
              " E-mail *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), className: "h-11 rounded-lg bg-background/45" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cpf", className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(IdCard, { className: "size-4 text-muted-foreground" }),
              " CPF *"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "cpf", inputMode: "numeric", autoComplete: "off", placeholder: "000.000.000-00", value: form.cpf, onChange: (e) => setForm({ ...form, cpf: maskCPF(e.target.value) }), className: "h-11 rounded-lg bg-background/45" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sexo *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroup, { value: form.sexo, onValueChange: (v) => setForm({ ...form, sexo: v }), className: "grid gap-2 pt-1 sm:grid-cols-2", children: ["Masculino", "Feminino", "Prefiro não informar"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex min-h-10 items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: s }),
              " ",
              s
            ] }, s)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t border-border pt-5 sm:pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BriefcaseBusiness, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold sm:text-lg", children: "Perfil e interesses" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Está empregado(a) no momento? *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { value: form.empregado === null ? "" : form.empregado ? "sim" : "nao", onValueChange: (v) => setForm({ ...form, empregado: v === "sim" }), className: "grid grid-cols-2 gap-3 sm:max-w-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex h-11 items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "sim" }),
                " Sim"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex h-11 items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RadioGroupItem, { value: "nao" }),
                " Não"
              ] })
            ] }),
            form.empregado && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Nome da empresa", value: form.empresa, onChange: (e) => setForm({ ...form, empresa: e.target.value }), className: "h-11 rounded-lg bg-background/45 sm:max-w-md" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gostaria de receber informações sobre *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2", children: INTERESSES_GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { className: "rounded-lg border border-border bg-muted/20 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "px-1 text-sm font-bold", children: g.group }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-3", children: g.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-start gap-3 text-sm leading-snug", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.interesses.includes(it), onCheckedChange: () => toggleInterest(it) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: it })
              ] }, it)) })
            ] }, g.group)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border-t border-border pt-5 sm:pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold sm:text-lg", children: "Termo de participação" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-44 overflow-auto rounded-lg border border-border bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line sm:p-4", children: TERM }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-4 flex cursor-pointer items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: form.termo_aceite, onCheckedChange: (c) => setForm({ ...form, termo_aceite: !!c }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Li e aceito os termos acima." })
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: loading, className: "h-12 rounded-lg btn-spin", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-5" }),
        loading ? "Enviando..." : "Continuar para a Roleta"
      ] })
    ] }) })
  ] }) });
}
const SEGMENT_COLORS = [
  "var(--wheel-dark)",
  "var(--wheel-blue)",
  "var(--wheel-navy)",
  "var(--wheel-purple)",
  "var(--wheel-dark)",
  "var(--wheel-teal)",
  "var(--wheel-navy)",
  "var(--wheel-purple)",
  "var(--wheel-dark)",
  "var(--wheel-teal)"
];
function splitPrize(label) {
  if (label === "NÃO FOI DESSA VEZ") return ["NÃO FOI", "DESSA VEZ"];
  if (label === "CONDIÇÃO ESPECIAL FÓRUM IEL") return ["CONDIÇÃO", "ESPECIAL", "FÓRUM IEL"];
  if (label === "CONDIÇÃO ESPECIAL ACADEMIA") return ["CONDIÇÃO", "ESPECIAL", "ACADEMIA"];
  if (label === "GANHOU REALIDADE VIRTUAL") return ["GANHOU", "REALIDADE", "VIRTUAL"];
  return label.split(" ");
}
function Wheel({ prizes, spinning, targetIndex, onSpinComplete }) {
  const segCount = prizes.length;
  const segAngle = 360 / segCount;
  const [rotation, setRotation] = reactExports.useState(0);
  const tickRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (spinning && targetIndex === null) {
      let last = performance.now();
      const tick = (t) => {
        const dt = t - last;
        last = t;
        setRotation((r) => r + dt * 0.6);
        tickRef.current = requestAnimationFrame(tick);
      };
      tickRef.current = requestAnimationFrame(tick);
      return () => {
        if (tickRef.current) cancelAnimationFrame(tickRef.current);
      };
    }
  }, [spinning, targetIndex]);
  reactExports.useEffect(() => {
    if (targetIndex !== null) {
      const finalBase = -targetIndex * segAngle - segAngle / 2;
      const currentMod = (rotation % 360 + 360) % 360;
      const targetMod = (finalBase % 360 + 360) % 360;
      const delta = (targetMod - currentMod + 360) % 360;
      setRotation(rotation + delta + 360 * 5);
      const id = setTimeout(() => onSpinComplete?.(), 4200);
      return () => clearTimeout(id);
    }
  }, [targetIndex]);
  const transition = targetIndex !== null ? "transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)" : "none";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-[min(88vw,460px)] aspect-square", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 -top-1 z-20 -translate-x-1/2 sm:-top-2", "aria-hidden": true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-white sm:border-l-[16px] sm:border-r-[16px] sm:border-t-[26px]",
        style: { filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full wheel-glow bg-wheel-navy" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-2 overflow-hidden rounded-full",
        style: { transform: `rotate(${rotation}deg)`, transition },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "-100 -100 200 200", className: "block h-full w-full", children: [
          prizes.map((label, i) => {
            const start = (i * segAngle - 90) * (Math.PI / 180);
            const end = ((i + 1) * segAngle - 90) * (Math.PI / 180);
            const mid = (i * segAngle + segAngle / 2 - 90) * (Math.PI / 180);
            const r = 100;
            const x1 = Math.cos(start) * r;
            const y1 = Math.sin(start) * r;
            const x2 = Math.cos(end) * r;
            const y2 = Math.sin(end) * r;
            const d = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
            const textX = Math.cos(mid) * 64;
            const textY = Math.sin(mid) * 64;
            const rawRotation = mid * 180 / Math.PI + 90;
            const textRotation = rawRotation > 90 && rawRotation < 270 ? rawRotation + 180 : rawRotation;
            const lines = splitPrize(label);
            const fontSize = lines.length >= 3 ? 5.2 : 5.8;
            const lineGap = fontSize + 1.2;
            const startY = -((lines.length - 1) * lineGap) / 2;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  d,
                  fill: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                  stroke: "oklch(0.15 0.04 265)",
                  strokeWidth: "0.55"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("g", { transform: `translate(${textX} ${textY}) rotate(${textRotation})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "text",
                {
                  textAnchor: "middle",
                  dominantBaseline: "middle",
                  fill: "white",
                  fontSize,
                  fontWeight: "800",
                  style: { letterSpacing: 0 },
                  children: lines.map((line, lineIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx("tspan", { x: "0", y: startY + lineIndex * lineGap, children: line }, line))
                }
              ) })
            ] }, `${label}-${i}`);
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "0", cy: "0", r: "22", fill: "oklch(0.35 0.18 295)", stroke: "white", strokeWidth: "0.8" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex h-[22%] w-[22%] items-center justify-center rounded-full",
        style: {
          background: "oklch(0.35 0.18 295)",
          boxShadow: "0 0 20px oklch(0.5 0.2 295 / 0.6)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Logo", className: "h-3/4 w-3/4 object-contain" })
      }
    ) })
  ] });
}
function WheelStep({ entryId, initialPrize, onResult }) {
  const spinFn = useServerFn(recordSpin);
  const prizesFn = useServerFn(getWheelPrizes);
  const [prizes, setPrizes] = reactExports.useState([]);
  const [spinning, setSpinning] = reactExports.useState(false);
  const [target, setTarget] = reactExports.useState(null);
  const [pendingPrize, setPendingPrize] = reactExports.useState(null);
  const [pendingPrizeIndex, setPendingPrizeIndex] = reactExports.useState(null);
  const [canStop, setCanStop] = reactExports.useState(false);
  reactExports.useEffect(() => {
    prizesFn().then((items) => setPrizes(items));
  }, [prizesFn]);
  reactExports.useEffect(() => {
    if (initialPrize) onResult(initialPrize);
  }, [initialPrize]);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex min-h-screen flex-col items-center justify-center px-3 py-5 sm:px-4 sm:py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "mb-3 text-center sm:mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Findes IEL", className: "mx-auto h-12 sm:h-14" }) }),
    prizes.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Wheel, { prizes, spinning, targetIndex: target, onSpinComplete: handleComplete }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-[min(88vw,460px)] w-[min(88vw,460px)] place-items-center rounded-full border border-border bg-card text-sm text-muted-foreground", children: "Carregando roleta..." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-7 grid w-full max-w-xs grid-cols-2 gap-3 sm:mt-10 sm:max-w-sm sm:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-spin rounded-full px-6 py-3 text-sm sm:px-10 sm:text-base", disabled: spinning || prizes.length === 0, onClick: handleSpin, children: "GIRAR" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-stop rounded-full px-6 py-3 text-sm sm:px-10 sm:text-base", disabled: !canStop || target !== null, onClick: handleStop, children: "PARAR" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xs text-center text-xs text-muted-foreground sm:max-w-sm", children: "Clique em GIRAR para iniciar a roleta. Após alguns segundos, clique em PARAR para revelar seu prêmio." })
  ] });
}
function ResultStep({ prize, senha, date, onBackHome }) {
  const isVR = isVrPrize(prize);
  const isWin = prize !== "NÃO FOI DESSA VEZ";
  const formatted = date ? new Date(date).toLocaleString("pt-BR") : (/* @__PURE__ */ new Date()).toLocaleString("pt-BR");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen flex flex-col items-center justify-center px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logoUrl, alt: "Findes IEL", className: "h-16 mb-6" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "w-full max-w-md rounded-lg border border-border bg-card p-7 text-center shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-sm uppercase tracking-widest text-muted-foreground", children: isWin ? "Parabéns!" : "Resultado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "h1",
        {
          className: "mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl",
          style: { color: isWin ? "var(--wheel-teal)" : "var(--foreground)" },
          children: prize
        }
      ),
      isVR && senha && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6 rounded-lg border border-accent/40 bg-accent/20 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2 text-xs uppercase tracking-wider text-muted-foreground", children: "Sua senha para retirar a experiência VR" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-5xl font-black tracking-[0.3em] text-accent", children: senha }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Apresente esta senha no balcão do evento." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground", children: formatted }),
      onBackHome && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: onBackHome, className: "mt-6 w-full rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "size-4" }),
        "Voltar ao início"
      ] })
    ] })
  ] });
}
const STORAGE_KEY = "iel_entry_id";
function Index() {
  const fetchEntry = useServerFn(getEntry);
  const [loading, setLoading] = reactExports.useState(true);
  const [entry, setEntry] = reactExports.useState(null);
  const [view, setView] = reactExports.useState("intro");
  reactExports.useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!id) {
      setLoading(false);
      return;
    }
    fetchEntry({
      data: {
        id
      }
    }).then((row) => {
      if (!row) {
        localStorage.removeItem(STORAGE_KEY);
        setLoading(false);
        return;
      }
      const e = row;
      setEntry(e);
      setView(e?.spun ? "result" : "wheel");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [fetchEntry]);
  function handleFirstTime() {
    localStorage.removeItem(STORAGE_KEY);
    setEntry(null);
    setView("form");
  }
  function handleExistingFound(found) {
    localStorage.setItem(STORAGE_KEY, found.id);
    setEntry(found);
    setView(found.spun ? "result" : "wheel");
  }
  function handleFormSubmitted(id) {
    localStorage.setItem(STORAGE_KEY, id);
    fetchEntry({
      data: {
        id
      }
    }).then((row) => {
      setEntry(row);
      setView("wheel");
    });
  }
  function handleResult(prize) {
    if (entry) {
      setEntry({
        ...entry,
        premio: prize,
        spun: true,
        spun_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    setView("result");
  }
  function handleBackHome() {
    localStorage.removeItem(STORAGE_KEY);
    setEntry(null);
    setView("intro");
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground", children: "Carregando..." });
  }
  if (view === "intro") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipationStep, { onFirstTime: handleFirstTime, onExistingFound: handleExistingFound });
  }
  if (view === "form" || !entry) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FormStep, { onSubmitted: handleFormSubmitted, onBack: () => setView("intro") });
  }
  if (view === "wheel") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(WheelStep, { entryId: entry.id, initialPrize: entry.premio, onResult: handleResult });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ResultStep, { prize: entry.premio ?? "", senha: entry.senha, date: entry.spun_at ?? void 0, onBackHome: handleBackHome });
}
export {
  Index as component
};
