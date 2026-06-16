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

    const normalizedLabels = rows.map((row) => row.label.toLocaleLowerCase("pt-BR"));
    if (new Set(normalizedLabels).size !== normalizedLabels.length) {
      throw new Error("Nao use opcoes de interesse com o mesmo nome.");
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
