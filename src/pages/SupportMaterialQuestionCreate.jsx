import { useEffect, useState } from "react";
import QuestionViewer from "../components/QuestionViewer";
import SupportMaterialCard from "../components/SupportMaterialCard";
import { get, post } from "../helpers/FecthApi";
import {
  extractTopicCatalog,
  normalizeQuestion,
  normalizeSupportMaterialsPage,
} from "../helpers/questionAdapter";
import { SUBJECTS, getSubjectById } from "../helpers/subjects";

const SUPPORT_MATERIALS_PER_PAGE = 5;

const SupportMaterialQuestionCreate = ({
  authUser,
  theme,
  onToggleTheme,
  onBack,
  onLogout,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicCatalog, setTopicCatalog] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState("");
  const [supportMaterials, setSupportMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState("");
  const [materialsPage, setMaterialsPage] = useState(1);
  const [totalMaterialPages, setTotalMaterialPages] = useState(1);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [hasMoreMaterials, setHasMoreMaterials] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchSupportMaterials = async () => {
      setIsLoadingMaterials(true);
      setMaterialsError("");

      try {
        const response = await get(
          `support-materials?page=${materialsPage}&items_per_page=${SUPPORT_MATERIALS_PER_PAGE}`,
        );

        if (!isMounted) {
          return;
        }

        const normalizedPage = normalizeSupportMaterialsPage(response, {
          fallbackCurrentPage: materialsPage,
          fallbackItemsPerPage: SUPPORT_MATERIALS_PER_PAGE,
        });

        setSupportMaterials(normalizedPage.items);
        setMaterialsPage(normalizedPage.currentPage);
        setTotalMaterialPages(normalizedPage.totalPages);
        setTotalMaterials(normalizedPage.totalItems);
        setHasMoreMaterials(normalizedPage.hasMore);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setSupportMaterials([]);
        setTotalMaterialPages(1);
        setTotalMaterials(0);
        setHasMoreMaterials(false);
        setMaterialsError("Nao foi possivel carregar os materiais de apoio.");
      } finally {
        if (isMounted) {
          setIsLoadingMaterials(false);
        }
      }
    };

    fetchSupportMaterials();

    return () => {
      isMounted = false;
    };
  }, [materialsPage]);

  useEffect(() => {
    let isMounted = true;

    const fetchTopicCatalog = async () => {
      if (!selectedSubjectId) {
        setTopicCatalog([]);
        setSelectedTopic("");
        setTopicsError("");
        setIsLoadingTopics(false);
        return;
      }

      const selectedSubject = getSubjectById(selectedSubjectId);

      if (!selectedSubject) {
        setTopicCatalog([]);
        setSelectedTopic("");
        setTopicsError("Nao foi possivel identificar a materia selecionada.");
        setIsLoadingTopics(false);
        return;
      }

      setIsLoadingTopics(true);
      setTopicsError("");

      try {
        const response = await get(selectedSubject.topicsEndpoint);

        if (!isMounted) {
          return;
        }

        setTopicCatalog(extractTopicCatalog(response));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setTopicCatalog([]);
        setTopicsError("Nao foi possivel carregar os topicos desta materia.");
      } finally {
        if (isMounted) {
          setIsLoadingTopics(false);
        }
      }
    };

    fetchTopicCatalog();

    return () => {
      isMounted = false;
    };
  }, [selectedSubjectId]);

  const handleSubjectChange = (event) => {
    setSelectedSubjectId(event.target.value);
    setSelectedTopic("");
    setGeneratedQuestion(null);
    setGenerationError("");
  };

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
    setGeneratedQuestion(null);
    setGenerationError("");
  };

  const handleToggleMaterialSelection = (materialId) => {
    setSelectedMaterialIds((currentIds) =>
      currentIds.includes(materialId)
        ? currentIds.filter((currentId) => currentId !== materialId)
        : [...currentIds, materialId],
    );
    setGeneratedQuestion(null);
    setGenerationError("");
  };

  const handleGenerateQuestion = async () => {
    const selectedSubject = getSubjectById(selectedSubjectId);

    if (!selectedSubject || !selectedTopic) {
      setGenerationError("Escolha a materia e o topico antes de gerar a questao.");
      return;
    }

    if (!selectedMaterialIds.length) {
      setGenerationError("Selecione ao menos um material de apoio para gerar a questao.");
      return;
    }

    setIsGeneratingQuestion(true);
    setGenerationError("");
    setGeneratedQuestion(null);

    try {
      const response = await post(`${selectedSubject.questionEndpoint}/with-support-materials`, {
        topic: selectedTopic,
        support_material_ids: selectedMaterialIds,
      });

      setGeneratedQuestion(normalizeQuestion(response));
    } catch (requestError) {
      setGenerationError(
        "Nao foi possivel gerar a questao com o material de apoio selecionado.",
      );
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handlePreviousPage = () => {
    setMaterialsPage((currentPage) => Math.max(currentPage - 1, 1));
  };

  const handleNextPage = () => {
    setMaterialsPage((currentPage) => Math.min(currentPage + 1, totalMaterialPages));
  };

  const handleGoToPage = (pageNumber) => {
    setMaterialsPage(pageNumber);
  };

  const pageNumbers = Array.from({ length: totalMaterialPages }, (_, index) => index + 1);

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>Gerar questao com material de apoio</h1>
          <p>
            Escolha a materia da questao, selecione um topico e combine um ou mais
            materiais existentes para forcar a geracao.
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

        <div className="question-form">
          <div className="question-form-grid">
            <label className="form-field">
              <span>Materia</span>
              <select value={selectedSubjectId} onChange={handleSubjectChange} required>
                <option value="" className="text-dark">
                  Selecione uma materia
                </option>
                {SUBJECTS.map((subjectOption) => (
                  <option key={subjectOption.id} value={subjectOption.id} className="text-dark">
                    {subjectOption.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Topico</span>
              <select
                value={selectedTopic}
                onChange={handleTopicChange}
                disabled={!selectedSubjectId || isLoadingTopics || topicCatalog.length === 0}
                required
              >
                <option value="" className="text-dark">
                  {!selectedSubjectId
                    ? "Selecione uma materia primeiro"
                    : isLoadingTopics
                      ? "Carregando topicos..."
                      : "Selecione um topico"}
                </option>
                {topicCatalog.map((topicEntry) => (
                  <option key={topicEntry.topic} value={topicEntry.topic} className="text-dark">
                    {topicEntry.topic}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {topicsError ? <p className="status-text status-text--error">{topicsError}</p> : null}
          {materialsError ? <p className="status-text status-text--error">{materialsError}</p> : null}
          {generationError ? <p className="status-text status-text--error">{generationError}</p> : null}

          <div className="question-form-section">
            <div className="screen-header screen-header--compact">
              <h2>Materiais disponiveis</h2>
              <p>
                A geracao usa a rota da materia com o sufixo
                <strong> /with-support-materials</strong> e envia o topico com os
                IDs dos materiais selecionados.
              </p>
            </div>

            {isLoadingMaterials ? <p className="status-text">Carregando materiais de apoio...</p> : null}

            {!isLoadingMaterials && !materialsError && supportMaterials.length === 0 ? (
              <p className="status-text">Nenhum material de apoio disponivel.</p>
            ) : null}

            {!isLoadingMaterials && !materialsError && supportMaterials.length > 0 ? (
              <>
                <div className="support-materials">
                  {supportMaterials.map((material) => {
                    const isSelected = selectedMaterialIds.includes(material.id);

                    return (
                      <SupportMaterialCard key={material.id} material={material}>
                        <div className="support-material-card__footer">
                          <p className="support-material-card__meta">ID: {material.id}</p>
                          <label className="support-material-card__meta">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleMaterialSelection(material.id)}
                              disabled={isGeneratingQuestion}
                            />{" "}
                            Selecionar este material
                          </label>
                        </div>
                      </SupportMaterialCard>
                    );
                  })}
                </div>

                <div className="toolbar toolbar--between">
                  <p className="support-material-card__meta">
                    Pagina {materialsPage} de {totalMaterialPages}. {totalMaterials} materiais no total.
                  </p>
                  <div className="pagination-carousel" aria-label="Paginacao dos materiais">
                    {materialsPage > 1 ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handlePreviousPage}
                        disabled={isLoadingMaterials}
                      >
                        Pagina anterior
                      </button>
                    ) : null}

                    <div className="pagination-carousel__pages">
                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          className={
                            pageNumber === materialsPage
                              ? "pagination-carousel__page pagination-carousel__page--active"
                              : "pagination-carousel__page"
                          }
                          onClick={() => handleGoToPage(pageNumber)}
                          disabled={isLoadingMaterials || pageNumber === materialsPage}
                          aria-label={`Ir para a pagina ${pageNumber}`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    {hasMoreMaterials ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={handleNextPage}
                        disabled={isLoadingMaterials}
                      >
                        Proxima pagina
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="toolbar toolbar--between">
                  <p className="support-material-card__meta">
                    {selectedMaterialIds.length === 0
                      ? "Nenhum material selecionado."
                      : selectedMaterialIds.length === 1
                        ? "1 material selecionado."
                        : `${selectedMaterialIds.length} materiais selecionados.`}
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleGenerateQuestion}
                    disabled={isGeneratingQuestion}
                  >
                    {isGeneratingQuestion
                      ? "Gerando questao..."
                      : "Gerar questao com materiais selecionados"}
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {!isGeneratingQuestion && generatedQuestion?.question ? (
            <div className="question-form-section">
              <div className="screen-header screen-header--compact">
                <h2>Questao gerada</h2>
                <p>
                  Resultado da geracao forcada para o topico <strong>{selectedTopic}</strong>.
                </p>
              </div>

              <QuestionViewer question={generatedQuestion} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default SupportMaterialQuestionCreate;
