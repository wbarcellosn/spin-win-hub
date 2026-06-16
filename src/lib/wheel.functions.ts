import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEFAULT_INTEREST_GROUPS } from "@/lib/form-options";

const DEFAULT_PRIZES = [
  "NÃO FOI DESSA VEZ",
  "GANHOU BRINDE",
  "NÃO FOI DESSA VEZ",
  "CONDIÇÃO ESPECIAL FÓRUM IEL",
  "NÃO FOI DESSA VEZ",
  "CONDIÇÃO ESPECIAL ACADEMIA",
  "NÃO FOI DESSA VEZ",
  "GANHOU REALIDADE VIRTUAL",
  "NÃO FOI DESSA VEZ",
  "GANHOU BRINDE",
] as const;

const submitSchema = z.object({
  nome: z.string().trim().min(1).max(200),
  telefone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(255),
  cpf: z.string().trim().refine(isValidCpf, "CPF inválido"),
  sexo: z.enum(["Masculino", "Feminino", "Prefiro não informar"]),
  empregado: z.boolean(),
  empresa: z.string().trim().max(200).optional().nullable(),
  interesses: z.array(z.string().min(1).max(200)).min(1).max(20),
  termo_aceite: z.literal(true),
});

const cpfSchema = z.object({
  cpf: z.string().trim().refine(isValidCpf, "CPF inválido"),
});

export function isValidCpf(value: string) {
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

  const digit1 = calcDigit(cpf.slice(0, 9), 10);
  const digit2 = calcDigit(cpf.slice(0, 10), 11);
  return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10]);
}

function makeSenha() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

async function ensureWheelPrizes() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("wheel_prizes")
    .select("id, label, position")
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  if (data.length > 0) return data;

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("wheel_prizes")
    .insert(DEFAULT_PRIZES.map((label, position) => ({ label, position })))
    .select("id, label, position")
    .order("position", { ascending: true });
  if (insertError) throw new Error(insertError.message);
  return inserted;
}

async function ensureInterestOptions() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("form_interest_options")
    .select("id, group_label, label, position")
    .order("position", { ascending: true });
  if (error) return DEFAULT_INTEREST_GROUPS;
  if (data.length > 0) {
    const groups: Array<{ group: string; items: string[] }> = [];
    for (const option of data) {
      let group = groups.find((item) => item.group === option.group_label);
      if (!group) {
        group = { group: option.group_label, items: [] };
        groups.push(group);
      }
      group.items.push(option.label);
    }
    return groups;
  }

  const seedRows = DEFAULT_INTEREST_GROUPS.flatMap((group, groupIndex) =>
    group.items.map((label, itemIndex) => ({
      group_label: group.group,
      label,
      position: groupIndex * 100 + itemIndex,
    })),
  );
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("form_interest_options")
    .insert(seedRows)
    .select("id, group_label, label, position")
    .order("position", { ascending: true });
  if (insertError || !inserted) return DEFAULT_INTEREST_GROUPS;

  return DEFAULT_INTEREST_GROUPS;
}

export const getWheelPrizes = createServerFn({ method: "GET" }).handler(async () => {
  const prizes = await ensureWheelPrizes();
  return prizes.map((prize) => prize.label);
});

export const getInterestOptions = createServerFn({ method: "GET" }).handler(async () => {
  return ensureInterestOptions();
});

export const submitForm = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submitSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cpf = data.cpf.replace(/\D/g, "");

    const { data: existing, error: existError } = await supabaseAdmin
      .from("entries")
      .select("id")
      .eq("cpf", cpf)
      .maybeSingle();
    if (existError) throw new Error(existError.message);
    if (existing) throw new Error("DUPLICATE_CPF");

    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: row, error } = await supabaseAdmin
        .from("entries")
        .insert({
          senha: makeSenha(),
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          cpf,
          sexo: data.sexo,
          empregado: data.empregado,
          empresa: data.empregado ? (data.empresa ?? null) : null,
          interesses: data.interesses,
          termo_aceite: true,
        })
        .select("id, senha")
        .single();

      if (!error && row) return { id: row.id, senha: row.senha };
      if (!error?.message.toLowerCase().includes("duplicate")) {
        throw new Error(error?.message ?? "Falha ao salvar cadastro");
      }
    }

    throw new Error("Não foi possível gerar uma senha única. Tente novamente.");
  });

export const getEntry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("entries")
      .select("id, senha, nome, premio, spun, spun_at, vr_used")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const getEntryByCpf = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => cpfSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("entries")
      .select("id, senha, nome, premio, spun, spun_at, vr_used")
      .eq("cpf", data.cpf.replace(/\D/g, ""))
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const recordSpin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing, error: readError } = await supabaseAdmin
      .from("entries")
      .select("spun, premio")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!existing) throw new Error("Entrada não encontrada");

    const prizes = await ensureWheelPrizes();

    if (existing.spun) {
      const idx = prizes.findIndex((p) => p.label === existing.premio);
      return { prizeIndex: idx >= 0 ? idx : 0, prize: existing.premio, alreadySpun: true };
    }

    const idx = Math.floor(Math.random() * prizes.length);
    const prize = prizes[idx].label;
    const { error: updateError } = await supabaseAdmin
      .from("entries")
      .update({ premio: prize, spun: true, spun_at: new Date().toISOString() })
      .eq("id", data.id);
    if (updateError) throw new Error(updateError.message);

    return { prizeIndex: idx, prize, alreadySpun: false };
  });
