const TopicSelection = ({
  authUser,
  subject,
  topics,
  isLoading,
  error,
  onBack,
  onLogout,
  onSelectTopic,
}) => {
  return (
    <section className="screen-card fade-in">
      <div className="screen-header">
        <span className="eyebrow">Etapa 2</span>
        <h1>Topicos de {subject.title}</h1>
        <p>Escolha um topico para gerar a proxima questao.</p>
      </div>

      <div className="toolbar toolbar--between">
        <p className="user-badge">
          Logado como <strong>{authUser?.name || authUser?.nickname || authUser?.email || "Usuario"}</strong>
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
  );
};

export default TopicSelection;
