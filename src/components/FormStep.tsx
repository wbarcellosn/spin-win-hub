import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BriefcaseBusiness, CheckCircle2, IdCard, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { z } from "zod";
import logoUrl from "@/assets/logo.png";
import { submitForm } from "@/lib/wheel.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TERM = `Declaro que concordo com a utilização dos dados pessoais por parte do IEL-ES para fins de avaliação de perfil profissional, participação em processos seletivos, divulgação de oportunidades profissionais, cursos, programas, eventos e demais iniciativas institucionais, bem como para a realização de pesquisas e levantamentos de interesse institucional.

Os dados pessoais informados serão tratados com segurança, confidencialidade e em conformidade com a Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018), observando-se os princípios da finalidade, adequação, necessidade e proteção dos direitos dos titulares dos dados.`;

const INTERESSES_GROUPS: Array<{ group: string; items: string[] }> = [
  {
    group: "Estágios e carreira",
    items: [
      "Sou empresa, quero contratar estagiário e/ou CLT",
      "Oportunidade de emprego/estágio",
      "Gestão de estágio",
    ],
  },
  {
    group: "Academia Findes de Negócios",
    items: ["Cursos e eventos da Academia Findes de Negócios", "Fórum IEL de Gestão 2026"],
  },
];

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(200),
  telefone: z.string().trim().min(8, "Telefone inválido").max(40),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().trim().refine(isValidCpf, "CPF inválido"),
  sexo: z.enum(["Masculino", "Feminino", "Prefiro não informar"]),
  empregado: z.boolean(),
  empresa: z.string().trim().max(200).optional(),
  interesses: z.array(z.string()).min(1, "Selecione ao menos um interesse"),
  termo_aceite: z.literal(true, { errorMap: () => ({ message: "É necessário aceitar o termo" }) }),
});

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

function maskPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length > 10) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

export default function FormStep({ onSubmitted, onBack }: { onSubmitted: (id: string) => void; onBack?: () => void }) {
  const submit = useServerFn(submitForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    sexo: "" as "" | "Masculino" | "Feminino" | "Prefiro não informar",
    empregado: null as null | boolean,
    empresa: "",
    interesses: [] as string[],
    termo_aceite: false,
  });

  function toggleInterest(item: string) {
    setForm((f) => ({
      ...f,
      interesses: f.interesses.includes(item)
        ? f.interesses.filter((x) => x !== item)
        : [...f.interesses, item],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({
      ...form,
      sexo: form.sexo || undefined,
      empregado: form.empregado ?? undefined,
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
          empresa: parsed.data.empregado ? parsed.data.empresa ?? "" : null,
        },
      });
      onSubmitted(res.id);
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === "DUPLICATE_CPF" || msg.includes("DUPLICATE_CPF")) {
        setError("Este CPF já participou. Volte e escolha “Já participei” para consultar o resultado.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <img src={logoUrl} alt="Findes IEL" className="mb-4 h-12 sm:mb-5 sm:h-14" />
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Cadastro para a Roleta</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Preencha seus dados com atenção. O CPF será usado para validar uma única participação.
            </p>
          </div>
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack} className="h-10 rounded-lg sm:w-auto">
              Voltar
            </Button>
          )}
        </header>

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card/85 p-4 shadow-2xl sm:p-7">
          <div className="grid gap-6 sm:gap-7">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <User className="size-5 text-primary" />
                <h2 className="text-base font-bold sm:text-lg">Dados pessoais</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="h-11 rounded-lg bg-background/45" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone" className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" /> Telefone *
                  </Label>
                  <Input id="telefone" inputMode="tel" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })} className="h-11 rounded-lg bg-background/45" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" /> E-mail *
                  </Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 rounded-lg bg-background/45" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf" className="flex items-center gap-2">
                    <IdCard className="size-4 text-muted-foreground" /> CPF *
                  </Label>
                  <Input id="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} className="h-11 rounded-lg bg-background/45" />
                </div>
                <div className="grid gap-2">
                  <Label>Sexo *</Label>
                  <RadioGroup value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v as typeof form.sexo })} className="grid gap-2 pt-1 sm:grid-cols-2">
                    {["Masculino", "Feminino", "Prefiro não informar"].map((s) => (
                      <label key={s} className="flex min-h-10 items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 text-sm">
                        <RadioGroupItem value={s} /> {s}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </section>

            <section className="border-t border-border pt-5 sm:pt-6">
              <div className="mb-4 flex items-center gap-2">
                <BriefcaseBusiness className="size-5 text-primary" />
                <h2 className="text-base font-bold sm:text-lg">Perfil e interesses</h2>
              </div>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label>Está empregado(a) no momento? *</Label>
                  <RadioGroup value={form.empregado === null ? "" : form.empregado ? "sim" : "nao"} onValueChange={(v) => setForm({ ...form, empregado: v === "sim" })} className="grid grid-cols-2 gap-3 sm:max-w-xs">
                    <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 text-sm">
                      <RadioGroupItem value="sim" /> Sim
                    </label>
                    <label className="flex h-11 items-center gap-2 rounded-lg border border-border bg-muted/25 px-3 text-sm">
                      <RadioGroupItem value="nao" /> Não
                    </label>
                  </RadioGroup>
                  {form.empregado && (
                    <Input placeholder="Nome da empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} className="h-11 rounded-lg bg-background/45 sm:max-w-md" />
                  )}
                </div>

                <div className="grid gap-3">
                  <Label>Gostaria de receber informações sobre *</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {INTERESSES_GROUPS.map((g) => (
                      <fieldset key={g.group} className="rounded-lg border border-border bg-muted/20 p-4">
                        <legend className="px-1 text-sm font-bold">{g.group}</legend>
                        <div className="mt-3 grid gap-3">
                          {g.items.map((it) => (
                            <label key={it} className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
                              <Checkbox checked={form.interesses.includes(it)} onCheckedChange={() => toggleInterest(it)} />
                              <span>{it}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t border-border pt-5 sm:pt-6">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h2 className="text-base font-bold sm:text-lg">Termo de participação</h2>
              </div>
              <div className="max-h-44 overflow-auto rounded-lg border border-border bg-background/40 p-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line sm:p-4">
                {TERM}
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox checked={form.termo_aceite} onCheckedChange={(c) => setForm({ ...form, termo_aceite: !!c })} />
                <span>Li e aceito os termos acima.</span>
              </label>
            </section>

            {error && (
              <p className="rounded-lg border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="h-12 rounded-lg btn-spin">
              <CheckCircle2 className="size-5" />
              {loading ? "Enviando..." : "Continuar para a Roleta"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
