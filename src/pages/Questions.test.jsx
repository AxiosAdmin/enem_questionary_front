import { render, screen } from "@testing-library/react";
import Questions from "./Questions";
import { post } from "../helpers/FecthApi";

jest.mock("../helpers/FecthApi", () => ({
  post: jest.fn(),
}));

describe("Questions support materials", () => {
  test("renders an image support material from base64 without requiring a public URL", async () => {
    post.mockResolvedValue({
      question: "Qual alternativa corresponde a imagem?",
      answer_a: "Opcao A",
      answer_b: "Opcao B",
      correct_answer: "A",
      support_materials: [
        {
          asset_type: "image",
          rendering_mode: "generated_image",
          position: "before_statement",
          title: "Figura 1",
          alt_text: "Descricao objetiva da imagem",
          mime_type: "image/png",
          file_base64: "iVBORw0KGgoAAAANSUhEUgAA...",
        },
      ],
    });

    render(
      <Questions
        authUser={{ name: "Pedro" }}
        subject={{ title: "Matematica", questionEndpoint: "questions/generate" }}
        topic="Estatistica"
        subtopic="Leitura e interpretacao de dados"
        onBack={jest.fn()}
        onLogout={jest.fn()}
      />,
    );

    const supportImage = await screen.findByRole("img", {
      name: "Descricao objetiva da imagem",
    });

    expect(supportImage).toHaveAttribute(
      "src",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    );
  });
});
