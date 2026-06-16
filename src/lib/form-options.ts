export type InterestGroup = {
  group: string;
  items: string[];
};

export const DEFAULT_INTEREST_GROUPS: InterestGroup[] = [
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
    items: ["Cursos e eventos da Academia Findes de Negócios", "Fórum IEL de Gestão 2026", "Programa Executivo Global - Xangai, China", "Curso de Formação de Conselheiros - IBGC"],
  },
];

export type FormSettings = {
  title: string;
  subtitle: string;
  term: string;
  submitLabel: string;
  sexoOptions: string[];
  empregadoSimLabel: string;
  empregadoNaoLabel: string;
};

export const DEFAULT_FORM_SETTINGS: FormSettings = {
  title: "Cadastro para a Roleta",
  subtitle: "Preencha seus dados com atenção. O CPF será usado para validar uma única participação.",
  term: `Declaro que concordo com a utilização dos dados pessoais por parte do IEL-ES/FINDES para fins de avaliação de perfil profissional, participação em processos seletivos, divulgação de oportunidades profissionais, cursos, programas, eventos e demais iniciativas institucionais, bem como para a realização de pesquisas e levantamentos de interesse institucional.

Os dados pessoais informados serão tratados com segurança, confidencialidade e em conformidade com a Lei Geral de Proteção de Dados Pessoais - LGPD (Lei nº 13.709/2018), observando-se os princípios da finalidade, adequação, necessidade e proteção dos direitos dos titulares dos dados.`,
  submitLabel: "Continuar para a Roleta",
  sexoOptions: ["Masculino", "Feminino", "Prefiro não informar"],
  empregadoSimLabel: "Sim",
  empregadoNaoLabel: "Não",
};
