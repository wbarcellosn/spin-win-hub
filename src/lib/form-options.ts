export type InterestGroup = {
  group: string;
  items: string[];
};

export const DEFAULT_INTEREST_GROUPS: InterestGroup[] = [
  {
    group: "Estagios e carreira",
    items: [
      "Sou empresa, quero contratar estagiario e/ou CLT",
      "Oportunidade de emprego/estagio",
      "Gestao de estagio",
    ],
  },
  {
    group: "Academia Findes de Negocios",
    items: ["Cursos e eventos da Academia Findes de Negocios", "Forum IEL de Gestao 2026"],
  },
];

