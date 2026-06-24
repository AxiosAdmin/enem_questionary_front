import {
  extractTopicCatalog,
  extractTopics,
  normalizeQuestion,
  normalizeSupportMaterialsPage,
} from "./questionAdapter";

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

describe("questionAdapter support materials", () => {
  test("normalizes the new support materials payload for text, table, and images", () => {
    const response = {
      data: {
        question: "Qual e a media de pontos da turma?",
        answer_a: "12",
        answer_b: "14",
        answer_c: "16",
        correct_answer: "C",
        support_materials: [
          {
            asset_type: "image",
            rendering_mode: "generated_image",
            position: "before_statement",
            title: "Figura 1",
            caption: "Imagem de apoio da questao",
            alt_text: "Descricao objetiva da imagem",
            source_label: "Texto elaborado para fins educacionais.",
            mime_type: "image/png",
            file_base64: "iVBORw0KGgoAAAANSUhEUgAA...",
            display_order: 2,
          },
          {
            asset_type: "table",
            rendering_mode: "structured_data",
            position: "before_statement",
            title: "Tabela 1",
            caption: "Dados usados na resolucao da questao",
            source_label: "Texto elaborado para fins educacionais.",
            display_order: 1,
            data: {
              columns: ["Aluno", "Pontos"],
              rows: [
                ["Ana", "14"],
                ["Bruno", "16"],
                ["Carla", "18"],
              ],
            },
          },
          {
            asset_type: "text",
            rendering_mode: "inline_text",
            position: "after_statement",
            title: "Texto I",
            caption: "Texto de apoio",
            source_label: "Texto elaborado para fins educacionais.",
            content:
              "O texto de apoio que o aluno precisa ler para responder a questao vem aqui.",
            display_order: 3,
          },
        ],
      },
    };

    expect(normalizeQuestion(response)).toEqual({
      question: "Qual e a media de pontos da turma?",
      options: [
        {
          label: "A",
          text: "12",
          explanation: "",
          isCorrect: false,
        },
        {
          label: "B",
          text: "14",
          explanation: "",
          isCorrect: false,
        },
        {
          label: "C",
          text: "16",
          explanation: "",
          isCorrect: false,
        },
      ],
      correctOptionLabel: "C",
      supportMaterials: [
        {
          id: "support-material-1",
          assetType: "table",
          renderingMode: "structured_data",
          position: "before_statement",
          displayOrder: 1,
          storageStatus: "not_required",
          title: "Tabela 1",
          caption: "Dados usados na resolucao da questao",
          altText: "",
          sourceLabel: "Texto elaborado para fins educacionais.",
          content: "",
          storageProvider: "",
          storageKey: "",
          publicUrl: "",
          fileBase64: "",
          imageGenerationPrompt: "",
          mimeType: "",
          data: {
            columns: ["Aluno", "Pontos"],
            rows: [
              ["Ana", "14"],
              ["Bruno", "16"],
              ["Carla", "18"],
            ],
          },
        },
        {
          id: "support-material-0",
          assetType: "image",
          renderingMode: "generated_image",
          position: "before_statement",
          displayOrder: 2,
          storageStatus: "not_required",
          title: "Figura 1",
          caption: "Imagem de apoio da questao",
          altText: "Descricao objetiva da imagem",
          sourceLabel: "Texto elaborado para fins educacionais.",
          content: "",
          storageProvider: "",
          storageKey: "",
          publicUrl: "",
          fileBase64: "iVBORw0KGgoAAAANSUhEUgAA...",
          imageGenerationPrompt: "",
          mimeType: "image/png",
          data: {},
        },
        {
          id: "support-material-2",
          assetType: "text",
          renderingMode: "inline_text",
          position: "after_statement",
          displayOrder: 3,
          storageStatus: "not_required",
          title: "Texto I",
          caption: "Texto de apoio",
          altText: "",
          sourceLabel: "Texto elaborado para fins educacionais.",
          content:
            "O texto de apoio que o aluno precisa ler para responder a questao vem aqui.",
          storageProvider: "",
          storageKey: "",
          publicUrl: "",
          fileBase64: "",
          imageGenerationPrompt: "",
          mimeType: "",
          data: {},
        },
      ],
    });
  });

  test("normalizes paginated support materials responses", () => {
    const response = {
      data: {
        items: [
          {
            id: "support-material-10",
            asset_type: "text",
            rendering_mode: "inline_text",
            title: "Texto II",
            content: "Material paginado.",
            display_order: 1,
          },
        ],
        page: 2,
        items_per_page: 5,
        total_count: 12,
        has_more: true,
      },
    };

    expect(normalizeSupportMaterialsPage(response)).toEqual({
      items: [
        {
          id: "support-material-10",
          assetType: "text",
          renderingMode: "inline_text",
          position: "before_statement",
          displayOrder: 1,
          storageStatus: "not_required",
          title: "Texto II",
          caption: "",
          altText: "",
          sourceLabel: "",
          content: "Material paginado.",
          storageProvider: "",
          storageKey: "",
          publicUrl: "",
          fileBase64: "",
          imageGenerationPrompt: "",
          mimeType: "",
          data: {},
        },
      ],
      currentPage: 2,
      itemsPerPage: 5,
      totalItems: 12,
      totalPages: 3,
      hasMore: true,
    });
  });

  test("keeps the requested page as fallback when the backend does not return page", () => {
    const response = {
      data: {
        items: [
          {
            id: "support-material-11",
            asset_type: "text",
            rendering_mode: "inline_text",
            title: "Texto III",
            content: "Material sem campo de pagina.",
          },
        ],
        items_per_page: 5,
        total_count: 12,
        has_more: true,
      },
    };

    expect(
      normalizeSupportMaterialsPage(response, {
        fallbackCurrentPage: 2,
        fallbackItemsPerPage: 5,
      }),
    ).toEqual({
      items: [
        {
          id: "support-material-11",
          assetType: "text",
          renderingMode: "inline_text",
          position: "before_statement",
          displayOrder: 0,
          storageStatus: "not_required",
          title: "Texto III",
          caption: "",
          altText: "",
          sourceLabel: "",
          content: "Material sem campo de pagina.",
          storageProvider: "",
          storageKey: "",
          publicUrl: "",
          fileBase64: "",
          imageGenerationPrompt: "",
          mimeType: "",
          data: {},
        },
      ],
      currentPage: 2,
      itemsPerPage: 5,
      totalItems: 12,
      totalPages: 3,
      hasMore: true,
    });
  });
});
