import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SupportMaterialsCreate from "./SupportMaterialsCreate";
import { post } from "../helpers/FecthApi";

jest.mock("../helpers/FecthApi", () => ({
  post: jest.fn(),
}));

describe("SupportMaterialsCreate", () => {
  const originalCrypto = global.crypto;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, "crypto", {
      value: {
        randomUUID: jest.fn(() => "12345678-1234-1234-1234-123456789012"),
      },
      configurable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(global, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
  });

  test("submits support materials to the dedicated endpoint", async () => {
    post.mockResolvedValue({});

    render(
      <SupportMaterialsCreate
        authUser={{ name: "Pedro" }}
        theme="light"
        onToggleTheme={jest.fn()}
        onBack={jest.fn()}
        onLogout={jest.fn()}
      />,
    );

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
      target: { value: "Um texto de apoio independente para reutilizacao." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Enviar materiais" }));

    await waitFor(() => {
      expect(post).toHaveBeenCalledWith("support-materials", {
        id: "12345678-1234-1234-1234-123456789012",
        asset_type: "text",
        rendering_mode: "inline_text",
        position: "before_statement",
        display_order: 0,
        storage_status: "not_required",
        title: "Texto I",
        caption: "Texto de apoio",
        source_label: "Texto elaborado para fins educacionais.",
        content: "Um texto de apoio independente para reutilizacao.",
        created_at: expect.any(String),
      });
    });
  });
});
