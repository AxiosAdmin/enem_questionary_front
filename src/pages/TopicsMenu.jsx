import { useEffect, useState } from "react";
import { get } from "../helpers/FecthApi";
import { extractTopics } from "../helpers/questionAdapter";

const TopicsMenu = ({ authUser, subject, onBack, onLogout, onSelectTopic }) => {
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchTopics = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await get(subject.topicsEndpoint);

        if (!isMounted) {
          return;
        }

        setTopics(extractTopics(data));
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setTopics([]);
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

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>Topicos de {subject.title}</h1>
          <p>Escolha um topico para gerar a proxima questao.</p>
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
            <button type="button" className="secondary-button" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>

        {isLoading ? <p className="status-text">Carregando topicos...</p> : null}
        {error ? <p className="status-text status-text--error">{error}</p> : null}

        {!isLoading && !error && topics.length === 0 ? (
          <p className="status-text">Nenhum topico disponivel para esta materia.</p>
        ) : null}

        <div className="topic-grid">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              className="topic-button"
              onClick={() => onSelectTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default TopicsMenu;
