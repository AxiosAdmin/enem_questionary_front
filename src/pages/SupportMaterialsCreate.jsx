import { useRef, useState } from "react";
import SupportMaterialsEditor from "../components/SupportMaterialsEditor";
import { post } from "../helpers/FecthApi";
import {
  buildSupportMaterialsPostPayload,
  createSupportMaterialDraft,
} from "../helpers/supportMaterials";

const SupportMaterialsCreate = ({
  authUser,
  theme,
  onToggleTheme,
  onBack,
  onLogout,
}) => {
  const nextSupportMaterialIdRef = useRef(0);
  const [supportMaterials, setSupportMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const addSupportMaterial = (assetType) => {
    clearMessages();
    setSupportMaterials((currentMaterials) => [
      ...currentMaterials,
      createSupportMaterialDraft(
        `support-material-${nextSupportMaterialIdRef.current++}`,
        assetType,
      ),
    ]);
  };

  const updateSupportMaterial = (materialId, fieldName, value) => {
    clearMessages();
    setSupportMaterials((currentMaterials) =>
      currentMaterials.map((material) =>
        material.id === materialId
          ? {
              ...material,
              [fieldName]: value,
            }
          : material,
      ),
    );
  };

  const removeSupportMaterial = (materialId) => {
    clearMessages();
    setSupportMaterials((currentMaterials) =>
      currentMaterials.filter((material) => material.id !== materialId),
    );
  };

  const moveSupportMaterial = (materialIndex, direction) => {
    const nextIndex = materialIndex + direction;

    if (nextIndex < 0 || nextIndex >= supportMaterials.length) {
      return;
    }

    clearMessages();
    setSupportMaterials((currentMaterials) => {
      const nextMaterials = [...currentMaterials];
      const [movedMaterial] = nextMaterials.splice(materialIndex, 1);
      nextMaterials.splice(nextIndex, 0, movedMaterial);
      return nextMaterials;
    });
  };

  const handleReset = () => {
    setSupportMaterials([]);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const normalizedSupportMaterials = buildSupportMaterialsPostPayload(supportMaterials);

      if (!normalizedSupportMaterials.length) {
        throw new Error("Adicione ao menos um material de apoio antes de enviar.");
      }

      await Promise.all(
        normalizedSupportMaterials.map((materialPayload) =>
          post("support-materials", materialPayload),
        ),
      );

      setSuccessMessage("Materiais de apoio enviados com sucesso.");
      setSupportMaterials([]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel enviar os materiais de apoio. Revise os campos e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>Criar materiais de apoio</h1>
          <p>
            Cada item sera enviado individualmente para o endpoint
            <strong> /support-materials</strong> no formato esperado pela rota.
          </p>
        </div>

        <div className="toolbar toolbar--between">
          <p className="user-badge">
            Logado como{" "}
            <strong>{authUser?.name || authUser?.nickname || authUser?.email || "Usuario"}</strong>
          </p>
          <div className="toolbar-group">
            <button type="button" className="secondary-button" onClick={onBack}>
              Voltar para materias
            </button>
            <button type="button" className="secondary-button" onClick={onToggleTheme}>
              {theme === "dark" ? "Modo claro" : "Modo escuro"}
            </button>
            <button type="button" className="secondary-button bg-danger" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>

        <form className="question-form" onSubmit={handleSubmit}>
          <SupportMaterialsEditor
            supportMaterials={supportMaterials}
            onAddSupportMaterial={addSupportMaterial}
            onMoveSupportMaterial={moveSupportMaterial}
            onRemoveSupportMaterial={removeSupportMaterial}
            onUpdateSupportMaterial={updateSupportMaterial}
            submissionHint="endpoint"
          />

          {error ? <p className="status-text status-text--error">{error}</p> : null}
          {successMessage ? <p className="status-text status-text--success">{successMessage}</p> : null}

          <div className="toolbar">
            <button type="submit" className="primary-button" disabled={isLoading}>
              {isLoading ? "Enviando materiais..." : "Enviar materiais"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
              disabled={isLoading}
            >
              Limpar formulario
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SupportMaterialsCreate;
