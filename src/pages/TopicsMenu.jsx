import { useEffect, useState } from "react";
import { get } from "../helpers/FecthApi";
import { extractTopicCatalog } from "../helpers/questionAdapter";

const TopicsMenu = ({
  authUser,
  subject,
  onBack,
  onLogout,
  onSelectTopicSelection,
}) => {
  const [topicCatalog, setTopicCatalog] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTopics = async () => {
      setIsLoading(true);
      setError("");
      setSelectedTopic("");
      setSelectedSubtopic("");

      try {
        const data = await get(subject.topicsEndpoint);

        if (!isMounted) {
          return;
        }

        setTopicCatalog(extractTopicCatalog(data));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setTopicCatalog([]);
        setError("Nao foi possivel carregar os topicos desta materia.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTopics();

    return () => {
      isMounted = false;
    };
  }, [subject]);

  const selectedTopicEntry =
    topicCatalog.find((topicEntry) => topicEntry.topic === selectedTopic) || null;
  const subtopics = selectedTopicEntry?.subtopics || [];
  const selectedSubtopicEntry =
    subtopics.find((subtopicEntry) => subtopicEntry.name === selectedSubtopic) || null;

  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
    setSelectedSubtopic("");
  };

  const handleStartQuestions = (event) => {
    event.preventDefault();

    if (!selectedTopic || !selectedSubtopic) {
      return;
    }

    onSelectTopicSelection({
      topic: selectedTopic,
      subtopic: selectedSubtopic,
    });
  };

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>Topicos de {subject.title}</h1>
          <p>Escolha um topico e depois um subtopico para gerar a proxima questao.</p>
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
            <button type="button" className="secondary-button bg-danger" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>

        {isLoading ? <p className="status-text">Carregando topicos...</p> : null}
        {error ? <p className="status-text status-text--error">{error}</p> : null}

        {!isLoading && !error && topicCatalog.length === 0 ? (
          <p className="status-text">Nenhum topico disponivel para esta materia.</p>
        ) : null}

        {!isLoading && !error && topicCatalog.length > 0 ? (
          <form className="question-form" onSubmit={handleStartQuestions}>
            <div className="question-form-grid">
              <label className="form-field">
                <span>Topico</span>
                <select value={selectedTopic} onChange={handleTopicChange} required>
                  <option value="">Selecione um topico</option>
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
                  value={selectedSubtopic}
                  onChange={(event) => setSelectedSubtopic(event.target.value)}
                  disabled={!selectedTopic || subtopics.length === 0}
                  required
                >
                  <option value="">
                    {selectedTopic ? "Selecione um subtopico" : "Escolha um topico primeiro"}
                  </option>
                  {subtopics.map((subtopicEntry) => (
                    <option key={subtopicEntry.name} value={subtopicEntry.name}>
                      {subtopicEntry.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedSubtopicEntry?.description ? (
              <div className="question-statement">
                <span className="question-label">Descricao do subtopico</span>
                <p>{selectedSubtopicEntry.description}</p>
              </div>
            ) : null}

            <div className="toolbar">
              <button
                type="submit"
                className="primary-button"
                disabled={!selectedTopic || !selectedSubtopic}
              >
                Gerar questao
              </button>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
};

export default TopicsMenu;
