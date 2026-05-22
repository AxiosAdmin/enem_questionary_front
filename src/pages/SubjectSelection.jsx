const SubjectSelection = ({
  authUser,
  subjects,
  onSelectSubject,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  return (
    <section className="screen-card fade-in">
      <div className="screen-header">
        <span className="eyebrow">Etapa 1</span>
        <h1>Escolha uma materia</h1>
        <p>
          Selecione uma area para carregar os topicos disponiveis e gerar uma
          questao personalizada.
        </p>
      </div>

      <div className="toolbar toolbar--between">
        <p className="user-badge">
          Logado como <strong>{authUser?.name || authUser?.nickname || authUser?.email || "Usuario"}</strong>
        </p>
        <div className="toolbar-group">
          <button type="button" className="secondary-button" onClick={onToggleTheme}>
            {theme === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
          <button type="button" className="secondary-button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="subject-grid">
        {subjects.map((subject) => (
          <article
            key={subject.id}
            className="subject-card"
            style={{ "--subject-accent": subject.accent }}
          >
            <div className="subject-card__content">
              <span className="subject-card__tag">ENEM</span>
              <h2>{subject.title}</h2>
              <p>{subject.description}</p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => onSelectSubject(subject)}
            >
              Ver topicos
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SubjectSelection;
