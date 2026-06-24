import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SupportMaterialQuestionCreate from "./SupportMaterialQuestionCreate";
import { get, post } from "../helpers/FecthApi";

jest.mock("../helpers/FecthApi", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("SupportMaterialQuestionCreate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows a validation message when trying to generate without selecting subject and topic", async () => {
    get.mockImplementation((endpoint) => {
      if (endpoint === "support-materials?page=1&items_per_page=5") {
        return Promise.resolve({
          data: {
            items: [
              {
                id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                asset_type: "text",
                rendering_mode: "inline_text",
                title: "Texto I",
                content: "Texto de apoio para gerar uma questao.",
              },
            ],
            items_per_page: 5,
            total_count: 1,
            has_more: false,
          },
        });
      }

      return Promise.reject(new Error("endpoint nao esperado"));
    });

    render(
      <SupportMaterialQuestionCreate
        authUser={{ name: "Pedro" }}
        theme="light"
        onToggleTheme={jest.fn()}
        onBack={jest.fn()}
        onLogout={jest.fn()}
      />,
    );

    await screen.findByText("Texto de apoio para gerar uma questao.");

    fireEvent.click(
      screen.getByRole("button", { name: "Gerar questao com materiais selecionados" }),
    );

    expect(
      await screen.findByText("Escolha a materia e o topico antes de gerar a questao."),
    ).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  test("loads support materials with pagination and generates a question with the selected subject and materials", async () => {
    get.mockImplementation((endpoint) => {
      if (endpoint === "support-materials?page=1&items_per_page=5") {
        return Promise.resolve({
          data: {
            items: [
              {
                id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                asset_type: "text",
                rendering_mode: "inline_text",
                title: "Texto I",
                content: "Texto de apoio para gerar uma questao.",
              },
              {
                id: "7aa7d9f1-9c5d-4b15-b2fe-0b9c1ab77890",
                asset_type: "table",
                rendering_mode: "structured_data",
                title: "Tabela 1",
                data: {
                  columns: ["Aluno", "Pontos"],
                  rows: [["Ana", "14"]],
                },
              },
            ],
            items_per_page: 5,
            total_count: 6,
            has_more: true,
          },
        });
      }

      if (endpoint === "support-materials?page=2&items_per_page=5") {
        return Promise.resolve({
          data: {
            items: [
              {
                id: "b19042f1-96eb-4558-a0d0-6491bd5687b1",
                asset_type: "text",
                rendering_mode: "inline_text",
                title: "Texto III",
                content: "Outro material carregado na segunda pagina.",
              },
            ],
            items_per_page: 5,
            total_count: 6,
            has_more: false,
          },
        });
      }

      if (endpoint === "ai/math/topics") {
        return Promise.resolve({
          data: [
            {
              topic: "Estatistica",
              subtopics: [],
            },
          ],
        });
      }

      return Promise.reject(new Error("endpoint nao esperado"));
    });

    post.mockResolvedValue({
      question: "Qual afirmacao esta de acordo com o texto de apoio?",
      answer_a: "Opcao A",
      answer_b: "Opcao B",
      correct_answer: "A",
      support_materials: [
        {
          id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          asset_type: "text",
          rendering_mode: "inline_text",
          title: "Texto I",
          content: "Texto de apoio para gerar uma questao.",
        },
        {
          id: "7aa7d9f1-9c5d-4b15-b2fe-0b9c1ab77890",
          asset_type: "table",
          rendering_mode: "structured_data",
          title: "Tabela 1",
          data: {
            columns: ["Aluno", "Pontos"],
            rows: [["Ana", "14"]],
          },
        },
      ],
    });

    render(
      <SupportMaterialQuestionCreate
        authUser={{ name: "Pedro" }}
        theme="light"
        onToggleTheme={jest.fn()}
        onBack={jest.fn()}
        onLogout={jest.fn()}
      />,
    );

    await screen.findByText("Texto de apoio para gerar uma questao.");
    expect(screen.getByText("Pagina 1 de 2. 6 materiais no total.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pagina anterior" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proxima pagina" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir para a pagina 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir para a pagina 2" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Materia"), {
      target: { value: "math" },
    });

    await screen.findByRole("option", { name: "Estatistica" });

    fireEvent.change(screen.getByLabelText("Topico"), {
      target: { value: "Estatistica" },
    });

    const materialCheckboxes = screen.getAllByLabelText("Selecionar este material");
    fireEvent.click(materialCheckboxes[0]);
    fireEvent.click(materialCheckboxes[1]);

    fireEvent.click(
      screen.getByRole("button", { name: "Gerar questao com materiais selecionados" }),
    );

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("ai/math/with-support-materials", {
        topic: "Estatistica",
        support_material_ids: [
          "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          "7aa7d9f1-9c5d-4b15-b2fe-0b9c1ab77890",
        ],
      });
    });

    expect(
      await screen.findByText("Qual afirmacao esta de acordo com o texto de apoio?"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ir para a pagina 2" }));

    expect(
      await screen.findByText("Outro material carregado na segunda pagina."),
    ).toBeInTheDocument();
    expect(screen.getByText("Pagina 2 de 2. 6 materiais no total.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pagina anterior" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Proxima pagina" })).not.toBeInTheDocument();
  });
});
