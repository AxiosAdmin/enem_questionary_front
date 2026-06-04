import { useEffect, useRef, useState } from "react";
import { get, post } from "../helpers/FecthApi";
import { extractTopicCatalog } from "../helpers/questionAdapter";
import { SUBJECTS, getSubjectById } from "../helpers/subjects";

const ANSWER_LABELS = ["A", "B", "C", "D", "E"];

const createUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16);
    const resolvedValue = character === "x" ? randomValue : (randomValue & 0x3) | 0x8;
    return resolvedValue.toString(16);
  });
};

const createInitialFormData = () => ({
  id: createUuid(),
  topic: "",
  subtopic: "",
  subtopic_description: "",
  diversity_mode: "balanced",
  question: "",
  answer_a: "",
  answer_b: "",
  answer_c: "",
  answer_d: "",
  answer_e: "",
  explanation_a: "",
  explanation_b: "",
  explanation_c: "",
  explanation_d: "",
  explanation_e: "",
  correct_answer: "A",
});

const ManualQuestionCreate = ({
  authUser,
  theme,
  onToggleTheme,
  onBack,
  onLogout,
}) => {
  const routeCreatedAtRef = useRef(new Date().toISOString());
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [topicCatalog, setTopicCatalog] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState("");
  const [formData, setFormData] = useState(createInitialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTopicCatalog = async () => {
      if (!selectedSubjectId) {
        setTopicCatalog([]);
        setTopicsError("");
        setIsLoadingTopics(false);
        return;
      }

      const selectedSubject = getSubjectById(selectedSubjectId);

      if (!selectedSubject) {
        setTopicCatalog([]);
        setTopicsError("Nao foi possivel identificar a materia selecionada.");
        setIsLoadingTopics(false);
        return;
      }

      setIsLoadingTopics(true);
      setTopicsError("");

      try {
        const data = await get(selectedSubject.topicsEndpoint);

        if (!isMounted) {
          return;
        }

        setTopicCatalog(extractTopicCatalog(data));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setTopicCatalog([]);
        setTopicsError("Nao foi possivel carregar topicos e subtopicos desta materia.");
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

  const selectedTopicEntry =
    topicCatalog.find((topicEntry) => topicEntry.topic === formData.topic) || null;
  const availableSubtopics = selectedTopicEntry?.subtopics || [];

  const handleFieldChange = (fieldName) => (event) => {
    const { value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [fieldName]: value,
    }));
  };

  const handleSubjectChange = (event) => {
    setSelectedSubjectId(event.target.value);
    setTopicCatalog([]);
    setTopicsError("");
    setSuccessMessage("");
    setError("");
    setFormData((currentFormData) => ({
      ...createInitialFormData(),
      id: currentFormData.id,
      question: currentFormData.question,
      answer_a: currentFormData.answer_a,
      answer_b: currentFormData.answer_b,
      answer_c: currentFormData.answer_c,
      answer_d: currentFormData.answer_d,
      answer_e: currentFormData.answer_e,
      explanation_a: currentFormData.explanation_a,
      explanation_b: currentFormData.explanation_b,
      explanation_c: currentFormData.explanation_c,
      explanation_d: currentFormData.explanation_d,
      explanation_e: currentFormData.explanation_e,
      correct_answer: currentFormData.correct_answer,
      diversity_mode: currentFormData.diversity_mode,
    }));
  };

  const handleTopicChange = (event) => {
    const nextTopic = event.target.value;

    setSuccessMessage("");
    setError("");
    setFormData((currentFormData) => ({
      ...currentFormData,
      topic: nextTopic,
      subtopic: "",
      subtopic_description: "",
    }));
  };

  const handleSubtopicChange = (event) => {
    const nextSubtopic = event.target.value;
    const matchedSubtopic =
      availableSubtopics.find((subtopicEntry) => subtopicEntry.name === nextSubtopic) || null;

    setSuccessMessage("");
    setError("");
    setFormData((currentFormData) => ({
      ...currentFormData,
      subtopic: nextSubtopic,
      subtopic_description: matchedSubtopic?.description || "",
    }));
  };

  const handleReset = () => {
    setSelectedSubjectId("");
    setTopicCatalog([]);
    setTopicsError("");
    setFormData(createInitialFormData());
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await post("questions", {
        ...formData,
        created_at: routeCreatedAtRef.current,
      });

      setSuccessMessage("Questao criada com sucesso.");
      setSelectedSubjectId("");
      setTopicCatalog([]);
      setTopicsError("");
      setFormData(createInitialFormData());
    } catch (requestError) {
      setError("Nao foi possivel criar a questao. Revise os campos e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>Criar questao manualmente</h1>
          <p>
            Escolha a materia, o topico e o subtopico antes de cadastrar a nova questao
            no endpoint <strong>/questions</strong>.
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
            <button type="button" className="secondary-button" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>

        <form className="question-form" onSubmit={handleSubmit}>
          <div className="question-form-grid">
            <label className="form-field">
              <span>Materia</span>
              <select value={selectedSubjectId} onChange={handleSubjectChange} required>
                <option value="">Selecione uma materia</option>
                {SUBJECTS.map((subjectOption) => (
                  <option key={subjectOption.id} value={subjectOption.id}>
                    {subjectOption.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Topico</span>
              <select
                value={formData.topic}
                onChange={handleTopicChange}
                disabled={!selectedSubjectId || isLoadingTopics || topicCatalog.length === 0}
                required
              >
                <option value="">
                  {!selectedSubjectId
                    ? "Selecione uma materia primeiro"
                    : isLoadingTopics
                      ? "Carregando topicos..."
                      : "Selecione um topico"}
                </option>
                {topicCatalog.map((topicEntry) => (
                  <option key={topicEntry.topic} value={topicEntry.topic}>
                    {topicEntry.topic}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Subtopico</span>
              <select
                value={formData.subtopic}
                onChange={handleSubtopicChange}
                disabled={!formData.topic || availableSubtopics.length === 0}
                required
              >
                <option value="">
                  {!formData.topic ? "Escolha um topico primeiro" : "Selecione um subtopico"}
                </option>
                {availableSubtopics.map((subtopicEntry) => (
                  <option key={subtopicEntry.name} value={subtopicEntry.name}>
                    {subtopicEntry.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>ID</span>
              <input
                type="text"
                value={formData.id}
                onChange={handleFieldChange("id")}
                placeholder="UUID da questao"
                required
              />
            </label>

            <label className="form-field">
              <span>Diversity mode</span>
              <input
                type="text"
                value={formData.diversity_mode}
                onChange={handleFieldChange("diversity_mode")}
                placeholder="Ex.: balanced"
                required
              />
            </label>

            <label className="form-field">
              <span>Resposta correta</span>
              <select
                value={formData.correct_answer}
                onChange={handleFieldChange("correct_answer")}
                required
              >
                {ANSWER_LABELS.map((answerLabel) => (
                  <option key={answerLabel} value={answerLabel}>
                    {answerLabel}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field form-field--full">
              <span>Descricao do subtopico</span>
              <textarea
                value={formData.subtopic_description}
                placeholder="A descricao sera preenchida automaticamente pelo subtopico selecionado"
                rows="3"
                readOnly
              />
            </label>

            <label className="form-field form-field--full">
              <span>Enunciado</span>
              <textarea
                value={formData.question}
                onChange={handleFieldChange("question")}
                placeholder="Digite a pergunta completa"
                rows="5"
                required
              />
            </label>
          </div>

          {isLoadingTopics ? <p className="status-text">Carregando topicos e subtopicos...</p> : null}
          {topicsError ? <p className="status-text status-text--error">{topicsError}</p> : null}

          <div className="question-form-section">
            <div className="screen-header screen-header--compact">
              <h2>Alternativas e explicacoes</h2>
              <p>Cada alternativa sera enviada com seu respectivo texto e explicacao.</p>
            </div>

            <div className="question-form-grid question-form-grid--split">
              {ANSWER_LABELS.map((answerLabel) => {
                const answerField = `answer_${answerLabel.toLowerCase()}`;
                const explanationField = `explanation_${answerLabel.toLowerCase()}`;

                return (
                  <div key={answerLabel} className="question-option-card">
                    <label className="form-field">
                      <span>Alternativa {answerLabel}</span>
                      <input
                        type="text"
                        value={formData[answerField]}
                        onChange={handleFieldChange(answerField)}
                        placeholder={`Texto da alternativa ${answerLabel}`}
                        required
                      />
                    </label>

                    <label className="form-field">
                      <span>Explicacao {answerLabel}</span>
                      <textarea
                        value={formData[explanationField]}
                        onChange={handleFieldChange(explanationField)}
                        placeholder={`Explique a alternativa ${answerLabel}`}
                        rows="4"
                        required
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {error ? <p className="status-text status-text--error">{error}</p> : null}
          {successMessage ? <p className="status-text status-text--success">{successMessage}</p> : null}

          <div className="toolbar">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading || !selectedSubjectId || !formData.topic || !formData.subtopic}
            >
              {isLoading ? "Salvando questao..." : "Criar questao"}
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

export default ManualQuestionCreate;
