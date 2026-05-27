export const SUBJECTS = [
  {
    id: "languages",
    title: "Linguagens",
    description: "Leitura, gramatica, literatura e interpretacao de texto.",
    topicsEndpoint: "ai/languages/topics",
    questionEndpoint: "ai/languages",
    accent: "var(--subject-languages)",
  },
  {
    id: "math",
    title: "Matematica",
    description: "Algebra, geometria, estatistica e raciocinio logico.",
    topicsEndpoint: "ai/math/topics",
    questionEndpoint: "ai/math",
    accent: "var(--subject-math)",
  },
  {
    id: "natural-sciences",
    title: "Ciencias da Natureza",
    description: "Biologia, quimica, fisica e analise cientifica.",
    topicsEndpoint: "ai/natural-sciences/topics",
    questionEndpoint: "ai/natural-sciences",
    accent: "var(--subject-natural)",
  },
  {
    id: "human-sciences",
    title: "Ciencias Humanas",
    description: "Historia, geografia, filosofia e sociologia.",
    topicsEndpoint: "ai/human-sciences/topics",
    questionEndpoint: "ai/human-sciences",
    accent: "var(--subject-human)",
  },
];

export const getSubjectById = (subjectId) =>
  SUBJECTS.find((subject) => subject.id === subjectId) || null;
