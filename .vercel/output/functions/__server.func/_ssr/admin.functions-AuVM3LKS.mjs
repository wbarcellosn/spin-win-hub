import { c as createServerRpc } from "./createServerRpc-GePVMvo7.mjs";
import { a as createServerFn } from "./server-gJkfgEhg.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-D1uD3tV3.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, s as stringType, a as arrayType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
async function assertAdmin(userId) {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado");
}
const adminListEntries_createServerFn_handler = createServerRpc({
  id: "91701904c4a88c998a107866d8807127df76cc1972c1e81307f1eaadfb29db74",
  name: "adminListEntries",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListEntries.__executeServer(opts));
const adminListEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListEntries_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("entries").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data;
});
const adminMarkVrUsed_createServerFn_handler = createServerRpc({
  id: "87570d6a0d7691dda0076084293ef336b17911fe92d43e09e9a67ee737cba380",
  name: "adminMarkVrUsed",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminMarkVrUsed.__executeServer(opts));
const adminMarkVrUsed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  used: booleanType()
}).parse(d)).handler(adminMarkVrUsed_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    error
  } = await supabaseAdmin.from("entries").update({
    vr_used: data.used
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminResetSpin_createServerFn_handler = createServerRpc({
  id: "62a09630ae892efc99d847cbb74d9a2e477d75d16edda2abe1140389189deccf",
  name: "adminResetSpin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminResetSpin.__executeServer(opts));
const adminResetSpin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(adminResetSpin_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    error
  } = await supabaseAdmin.from("entries").update({
    spun: false,
    premio: null,
    spun_at: null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListWheelPrizes_createServerFn_handler = createServerRpc({
  id: "1d5154eba6fa00ac95e815449ea093f347b48563c33bbbb067ece453f3b9060b",
  name: "adminListWheelPrizes",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminListWheelPrizes.__executeServer(opts));
const adminListWheelPrizes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminListWheelPrizes_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data,
    error
  } = await supabaseAdmin.from("wheel_prizes").select("id, label, position").order("position", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data;
});
const adminSaveWheelPrizes_createServerFn_handler = createServerRpc({
  id: "ee833e4f45be3fcc98c6b8a8c97b04e32f93e9bf81c1f77fad047726ba34e147",
  name: "adminSaveWheelPrizes",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveWheelPrizes.__executeServer(opts));
const adminSaveWheelPrizes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  labels: arrayType(stringType().trim().min(1).max(80)).min(2).max(16)
}).parse(d)).handler(adminSaveWheelPrizes_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const normalized = data.labels.map((label) => label.trim().toUpperCase());
  const {
    error: deleteError
  } = await supabaseAdmin.from("wheel_prizes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) throw new Error(deleteError.message);
  const {
    error: insertError
  } = await supabaseAdmin.from("wheel_prizes").insert(normalized.map((label, position) => ({
    label,
    position
  })));
  if (insertError) throw new Error(insertError.message);
  return {
    ok: true
  };
});
const adminIsAdmin_createServerFn_handler = createServerRpc({
  id: "8110b640fbabe7b99a6b84747433f9bf498ae415f0f4b203e0076410d9c92c27",
  name: "adminIsAdmin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminIsAdmin.__executeServer(opts));
const adminIsAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(adminIsAdmin_createServerFn_handler, async ({
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
  return {
    isAdmin: !!data
  };
});
const adminExists_createServerFn_handler = createServerRpc({
  id: "8b404eadc272d7d27f48745f2fd105c6bc74772c80d7e5eb87638d43cd197daa",
  name: "adminExists",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminExists.__executeServer(opts));
const adminExists = createServerFn({
  method: "GET"
}).handler(adminExists_createServerFn_handler, async () => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    count,
    error
  } = await supabaseAdmin.from("user_roles").select("*", {
    count: "exact",
    head: true
  }).eq("role", "admin");
  if (error) throw new Error(error.message);
  return {
    exists: (count ?? 0) > 0
  };
});
const bootstrapAdmin_createServerFn_handler = createServerRpc({
  id: "8b5e87060261a59e92bcd5e92ce4cf6afa0ee8e3737aa66e7c16f0be951897c6",
  name: "bootstrapAdmin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => bootstrapAdmin.__executeServer(opts));
const bootstrapAdmin = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(255),
  password: stringType().min(8).max(128)
}).parse(d)).handler(bootstrapAdmin_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    count,
    error: countError
  } = await supabaseAdmin.from("user_roles").select("*", {
    count: "exact",
    head: true
  }).eq("role", "admin");
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) throw new Error("Já existe um administrador. Faça login.");
  const {
    data: created,
    error
  } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true
  });
  if (error || !created.user) throw new Error(error?.message ?? "Falha ao criar conta");
  const {
    error: roleErr
  } = await supabaseAdmin.from("user_roles").insert({
    user_id: created.user.id,
    role: "admin"
  });
  if (roleErr) throw new Error(roleErr.message);
  return {
    ok: true
  };
});
export {
  adminExists_createServerFn_handler,
  adminIsAdmin_createServerFn_handler,
  adminListEntries_createServerFn_handler,
  adminListWheelPrizes_createServerFn_handler,
  adminMarkVrUsed_createServerFn_handler,
  adminResetSpin_createServerFn_handler,
  adminSaveWheelPrizes_createServerFn_handler,
  bootstrapAdmin_createServerFn_handler
};
