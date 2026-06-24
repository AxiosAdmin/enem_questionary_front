import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ManualQuestionCreate from "./ManualQuestionCreate";
import { get, post } from "../helpers/FecthApi";

jest.mock("../helpers/FecthApi", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe("ManualQuestionCreate support materials", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("submits support materials in the new payload shape", async () => {
    get.mockResolvedValue({
      data: [
        {
          topic: "Estatistica",
          subtopics: [
            {
              name: "Leitura e interpretacao de dados",
              description: "Interpretacao de tabelas e graficos.",
            },
          ],
        },
      ],
    });
    post.mockResolvedValue({});

    render(
      <ManualQuestionCreate
        authUser={{ name: "Pedro" }}
        theme="light"
        onToggleTheme={jest.fn()}
        onBack={jest.fn()}
        onLogout={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Materia"), {
      target: { value: "math" },
    });

    await screen.findByRole("option", { name: "Estatistica" });

    fireEvent.change(screen.getByLabelText("Topico"), {
      target: { value: "Estatistica" },
    });
    fireEvent.change(screen.getByLabelText("Subtopico"), {
      target: { value: "Leitura e interpretacao de dados" },
    });

    fireEvent.change(screen.getByLabelText("Sintese da questao"), {
      target: { value: "Leitura de dados" },
    });
    fireEvent.change(screen.getByLabelText("Enunciado"), {
      target: { value: "Com base no texto de apoio, qual alternativa esta correta?" },
    });

    ["A", "B", "C", "D", "E"].forEach((label) => {
      fireEvent.change(screen.getByLabelText(`Alternativa ${label}`), {
        target: { value: `Opcao ${label}` },
      });
      fireEvent.change(screen.getByLabelText(`Explicacao ${label}`), {
        target: { value: `Explicacao ${label}` },
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Adicionar texto" }));

    fireEvent.change(screen.getByLabelText("Titulo"), {
      target: { value: "Texto I" },
    });
    fireEvent.change(screen.getByLabelText("Legenda"), {
      target: { value: "Texto de apoio" },
    });
    fireEvent.change(screen.getByLabelText("Fonte"), {
      target: { value: "Texto elaborado para fins educacionais." },
    });
    fireEvent.change(screen.getByLabelText("Conteudo"), {
      target: {
        value: "O texto de apoio que o aluno precisa ler para responder a questao vem aqui.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Criar questao" }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith(
        "questions",
        expect.objectContaining({
          topic: "Estatistica",
          subtopic: "Leitura e interpretacao de dados",
          question: "Com base no texto de apoio, qual alternativa esta correta?",
          support_materials: [
            {
              asset_type: "text",
              rendering_mode: "inline_text",
              position: "before_statement",
              title: "Texto I",
              caption: "Texto de apoio",
              source_label: "Texto elaborado para fins educacionais.",
              content:
                "O texto de apoio que o aluno precisa ler para responder a questao vem aqui.",
            },
          ],
        }),
      );
    });
  });
});
