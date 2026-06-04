import { extractTopicCatalog, extractTopics } from "./questionAdapter";

describe("questionAdapter topic catalog", () => {
  test("normalizes topic and subtopic data from the new topics response", () => {
    const response = {
      data: [
        {
          topic: "Geometria",
          subtopics: [
            {
              name: "Figuras planas e espaciais",
              description: "Identificacao de caracteristicas e propriedades.",
            },
          ],
        },
      ],
    };

    expect(extractTopicCatalog(response)).toEqual([
      {
        topic: "Geometria",
        subtopics: [
          {
            name: "Figuras planas e espaciais",
            description: "Identificacao de caracteristicas e propriedades.",
          },
        ],
      },
    ]);
  });

  test("keeps a flat list of topic names available for compatibility", () => {
    const response = {
      data: [
        {
          topic: "Algebra e modelagem",
          subtopics: [{ name: "Representacoes algebricas de grandezas" }],
        },
        {
          topic: "Estatistica e probabilidade",
          subtopics: [{ name: "Medidas estatisticas" }],
        },
      ],
    };

    expect(extractTopics(response)).toEqual([
      "Algebra e modelagem",
      "Estatistica e probabilidade",
    ]);
  });
});
