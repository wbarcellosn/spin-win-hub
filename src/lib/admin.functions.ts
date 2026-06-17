import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DEFAULT_FORM_SETTINGS, DEFAULT_INTEREST_GROUPS, type FormSettings } from "@/lib/form-options";
import { z } from "zod";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado");
}

export const adminListEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminMarkVrUsed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), used: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("entries")
      .update({ vr_used: data.used })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetSpin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("entries")
      .update({ spun: false, premio: null, spun_at: null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListWheelPrizes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("wheel_prizes")
      .select("id, label, position")
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminSaveWheelPrizes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      labels: z.array(z.string().trim().min(1).max(80)).min(2).max(16),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalized = data.labels.map((label) => label.trim().toUpperCase());

    const { error: deleteError } = await supabaseAdmin
      .from("wheel_prizes")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) throw new Error(deleteError.message);

    const { error: insertError } = await supabaseAdmin
      .from("wheel_prizes")
      .insert(normalized.map((label, position) => ({ label, position })));
    if (insertError) throw new Error(insertError.message);

    return { ok: true };
  });

export const adminListInterestOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("form_interest_options")
      .select("id, group_label, label, position")
      .order("position", { ascending: true });
    if (error) return DEFAULT_INTEREST_GROUPS;
    if (!data || data.length === 0) return DEFAULT_INTEREST_GROUPS;

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
  });

export const adminSaveInterestOptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      groups: z.array(z.object({
        group: z.string().trim().min(1).max(80),
        items: z.array(z.string().trim().min(1).max(200)).min(1).max(30),
      })).min(1).max(12),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rows = data.groups.flatMap((group, groupIndex) =>
      group.items.map((label, itemIndex) => ({
        group_label: group.group.trim(),
        label: label.trim(),
        position: groupIndex * 100 + itemIndex,
      })),
    );

    const dupKeys = rows.map((row) => `${row.group_label.toLocaleLowerCase("pt-BR")}::${row.label.toLocaleLowerCase("pt-BR")}`);
    if (new Set(dupKeys).size !== dupKeys.length) {
      throw new Error("Há opções duplicadas dentro do mesmo grupo.");
    }

    const { error: deleteError } = await supabaseAdmin
      .from("form_interest_options")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) throw new Error(deleteError.message);

    const { error: insertError } = await supabaseAdmin
      .from("form_interest_options")
      .insert(rows);
    if (insertError) throw new Error(insertError.message);

    return { ok: true };
  });

export const adminIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error(error.message);
  return { exists: (count ?? 0) > 0 };
});

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      email: z.string().email().max(255),
      password: z.string().min(8).max(128),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("Já existe um administrador. Faça login.");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar conta");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) throw new Error(roleErr.message);

    return { ok: true };
  });

type DashboardBucket = {
  label: string;
  count: number;
  percent: number;
};

type DashboardEntry = {
  sexo: string | null;
  empregado: boolean | null;
  empresa: string | null;
  email: string | null;
  premio: string | null;
  interesses: string[] | null;
};

function normalizeMetricText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function pct(count: number, total: number) {
  if (total === 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function bucketFromMap(map: Map<string, number>, total: number) {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count, percent: pct(count, total) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
}

export const adminGetDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("entries")
      .select("sexo, empregado, empresa, email, premio, interesses");
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as DashboardEntry[];
    const totalParticipants = rows.length;
    const genderMap = new Map<string, number>();
    const employmentMap = new Map<string, number>();
    const prizeMap = new Map<string, number>();
    const interestMap = new Map<string, number>();
    const orgMap = new Map<string, number>([
      ["SESI", 0],
      ["SENAI", 0],
      ["FINDES", 0],
    ]);
    let orgTotal = 0;

    const { data: interestRows } = await supabaseAdmin
      .from("form_interest_options")
      .select("label, position")
      .order("position", { ascending: true });
    const knownInterestLabels = (interestRows?.length
      ? interestRows.map((item) => item.label)
      : DEFAULT_INTEREST_GROUPS.flatMap((group) => group.items)
    ).filter(Boolean);
    for (const label of knownInterestLabels) interestMap.set(label, 0);

    for (const row of rows) {
      const gender = row.sexo?.trim() || "Não informado";
      genderMap.set(gender, (genderMap.get(gender) ?? 0) + 1);

      const employment = row.empregado ? "Empregadas" : "Desempregadas";
      employmentMap.set(employment, (employmentMap.get(employment) ?? 0) + 1);

      const prize = row.premio?.trim() || "Ainda não girou";
      prizeMap.set(prize, (prizeMap.get(prize) ?? 0) + 1);

      const selectedInterests = new Set(Array.isArray(row.interesses) ? row.interesses : []);
      for (const label of selectedInterests) {
        interestMap.set(label, (interestMap.get(label) ?? 0) + 1);
      }

      const company = normalizeMetricText(row.empresa);
      const email = (row.email ?? "").toLowerCase();
      let matchedOrg = false;
      for (const org of ["SESI", "SENAI", "FINDES"]) {
        const match = company.includes(org) || email.includes(`@${org.toLowerCase()}`);
        if (match) {
          orgMap.set(org, (orgMap.get(org) ?? 0) + 1);
          matchedOrg = true;
        }
      }
      if (matchedOrg) orgTotal += 1;
    }

    return {
      totalParticipants,
      genders: bucketFromMap(genderMap, totalParticipants),
      employment: bucketFromMap(employmentMap, totalParticipants),
      prizes: bucketFromMap(prizeMap, totalParticipants),
      interests: bucketFromMap(interestMap, totalParticipants),
      organizations: {
        total: orgTotal,
        percent: pct(orgTotal, totalParticipants),
        items: bucketFromMap(orgMap, totalParticipants),
      },
    };
  });

const formSettingsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(500),
  term: z.string().trim().min(1).max(5000),
  submitLabel: z.string().trim().min(1).max(80),
  sexoOptions: z.array(z.string().trim().min(1).max(80)).min(1).max(10),
  empregadoSimLabel: z.string().trim().min(1).max(40),
  empregadoNaoLabel: z.string().trim().min(1).max(40),
}) satisfies z.ZodType<FormSettings>;

export const adminGetFormSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("form_settings").select("key, value");
    if (error || !data) return DEFAULT_FORM_SETTINGS;
    const map = new Map(data.map((r) => [r.key, r.value]));
    const merged: FormSettings = { ...DEFAULT_FORM_SETTINGS };
    for (const k of Object.keys(merged) as Array<keyof FormSettings>) {
      const v = map.get(k);
      if (v !== undefined && v !== null) (merged as Record<string, unknown>)[k] = v;
    }
    return merged;
  });

export const adminSaveFormSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => formSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = (Object.entries(data) as Array<[string, unknown]>).map(([key, value]) => ({
      key,
      value: value as never,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin.from("form_settings").upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
