import { c as createServerRpc } from "./createServerRpc-GePVMvo7.mjs";
import { a as createServerFn } from "./server-gJkfgEhg.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, l as literalType, a as arrayType, s as stringType, b as booleanType, e as enumType } from "../_libs/zod.mjs";
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
const DEFAULT_PRIZES = ["NÃO FOI DESSA VEZ", "GANHOU BRINDE", "NÃO FOI DESSA VEZ", "CONDIÇÃO ESPECIAL FÓRUM IEL", "NÃO FOI DESSA VEZ", "CONDIÇÃO ESPECIAL ACADEMIA", "NÃO FOI DESSA VEZ", "GANHOU REALIDADE VIRTUAL", "NÃO FOI DESSA VEZ", "GANHOU BRINDE"];
const submitSchema = objectType({
  nome: stringType().trim().min(1).max(200),
  telefone: stringType().trim().min(1).max(40),
  email: stringType().trim().email().max(255),
  cpf: stringType().trim().refine(isValidCpf, "CPF inválido"),
  sexo: enumType(["Masculino", "Feminino", "Prefiro não informar"]),
  empregado: booleanType(),
  empresa: stringType().trim().max(200).optional().nullable(),
  interesses: arrayType(stringType().min(1).max(200)).min(1).max(20),
  termo_aceite: literalType(true)
});
const cpfSchema = objectType({
  cpf: stringType().trim().refine(isValidCpf, "CPF inválido")
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
  const digit1 = calcDigit(cpf.slice(0, 9), 10);
  const digit2 = calcDigit(cpf.slice(0, 10), 11);
  return digit1 === Number(cpf[9]) && digit2 === Number(cpf[10]);
}
function makeSenha() {
  return String(Math.floor(1e4 + Math.random() * 9e4));
}
async function ensureWheelPrizes() {
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
  if (data.length > 0) return data;
  const {
    data: inserted,
    error: insertError
  } = await supabaseAdmin.from("wheel_prizes").insert(DEFAULT_PRIZES.map((label, position) => ({
    label,
    position
  }))).select("id, label, position").order("position", {
    ascending: true
  });
  if (insertError) throw new Error(insertError.message);
  return inserted;
}
const getWheelPrizes_createServerFn_handler = createServerRpc({
  id: "a0184961e7d75500479c7fa26bae229ea863e37aaab3dbe9d93e7d57038a20b9",
  name: "getWheelPrizes",
  filename: "src/lib/wheel.functions.ts"
}, (opts) => getWheelPrizes.__executeServer(opts));
const getWheelPrizes = createServerFn({
  method: "GET"
}).handler(getWheelPrizes_createServerFn_handler, async () => {
  const prizes = await ensureWheelPrizes();
  return prizes.map((prize) => prize.label);
});
const submitForm_createServerFn_handler = createServerRpc({
  id: "aec28097a9b8c76b2cdefd0afd6e15475526a298afcf7e8bf06de95eb9770d84",
  name: "submitForm",
  filename: "src/lib/wheel.functions.ts"
}, (opts) => submitForm.__executeServer(opts));
const submitForm = createServerFn({
  method: "POST"
}).inputValidator((d) => submitSchema.parse(d)).handler(submitForm_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const cpf = data.cpf.replace(/\D/g, "");
  const {
    data: existing,
    error: existError
  } = await supabaseAdmin.from("entries").select("id").eq("cpf", cpf).maybeSingle();
  if (existError) throw new Error(existError.message);
  if (existing) throw new Error("DUPLICATE_CPF");
  for (let attempt = 0; attempt < 5; attempt++) {
    const {
      data: row,
      error
    } = await supabaseAdmin.from("entries").insert({
      senha: makeSenha(),
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      cpf,
      sexo: data.sexo,
      empregado: data.empregado,
      empresa: data.empregado ? data.empresa ?? null : null,
      interesses: data.interesses,
      termo_aceite: true
    }).select("id, senha").single();
    if (!error && row) return {
      id: row.id,
      senha: row.senha
    };
    if (!error?.message.toLowerCase().includes("duplicate")) {
      throw new Error(error?.message ?? "Falha ao salvar cadastro");
    }
  }
  throw new Error("Não foi possível gerar uma senha única. Tente novamente.");
});
const getEntry_createServerFn_handler = createServerRpc({
  id: "f2a46cde8c4c87131db02fddf9f22b85b49c65c55c3dd48fe73360a61fa91916",
  name: "getEntry",
  filename: "src/lib/wheel.functions.ts"
}, (opts) => getEntry.__executeServer(opts));
const getEntry = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getEntry_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("entries").select("id, senha, nome, premio, spun, spun_at, vr_used").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  return row;
});
const getEntryByCpf_createServerFn_handler = createServerRpc({
  id: "44954dc1e88408f4a289504814e6c703f0e8f510cdcd42f5cb9d4e396e5bae44",
  name: "getEntryByCpf",
  filename: "src/lib/wheel.functions.ts"
}, (opts) => getEntryByCpf.__executeServer(opts));
const getEntryByCpf = createServerFn({
  method: "POST"
}).inputValidator((d) => cpfSchema.parse(d)).handler(getEntryByCpf_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data: row,
    error
  } = await supabaseAdmin.from("entries").select("id, senha, nome, premio, spun, spun_at, vr_used").eq("cpf", data.cpf.replace(/\D/g, "")).maybeSingle();
  if (error) throw new Error(error.message);
  return row;
});
const recordSpin_createServerFn_handler = createServerRpc({
  id: "b0732aed35a213098fc32a2935a5f408e321083ddd7f0ca0c6f4c128ad0eb973",
  name: "recordSpin",
  filename: "src/lib/wheel.functions.ts"
}, (opts) => recordSpin.__executeServer(opts));
const recordSpin = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(recordSpin_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-Be-l8ZGG.mjs");
  const {
    data: existing,
    error: readError
  } = await supabaseAdmin.from("entries").select("spun, premio").eq("id", data.id).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!existing) throw new Error("Entrada não encontrada");
  const prizes = await ensureWheelPrizes();
  if (existing.spun) {
    const idx2 = prizes.findIndex((p) => p.label === existing.premio);
    return {
      prizeIndex: idx2 >= 0 ? idx2 : 0,
      prize: existing.premio,
      alreadySpun: true
    };
  }
  const idx = Math.floor(Math.random() * prizes.length);
  const prize = prizes[idx].label;
  const {
    error: updateError
  } = await supabaseAdmin.from("entries").update({
    premio: prize,
    spun: true,
    spun_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (updateError) throw new Error(updateError.message);
  return {
    prizeIndex: idx,
    prize,
    alreadySpun: false
  };
});
export {
  getEntryByCpf_createServerFn_handler,
  getEntry_createServerFn_handler,
  getWheelPrizes_createServerFn_handler,
  recordSpin_createServerFn_handler,
  submitForm_createServerFn_handler
};
