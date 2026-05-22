const QuestionStep = ({
  authUser,
  subject,
  topic,
  question,
  isLoading,
  error,
  selectedOptionLabel,
  onSelectOption,
  onBack,
  onGenerateAnother,
  onLogout,
}) => {
  const hasAnswered = Boolean(selectedOptionLabel);
  const correctOptionLabel = question?.correctOptionLabel || "";
  const isCorrect = hasAnswered && selectedOptionLabel === correctOptionLabel;

  return (
    <section className="screen-card fade-in">
      <div className="screen-header">
        <span className="eyebrow">Etapa 3</span>
        <h1>{subject.title}</h1>
        <p>
          Topico selecionado: <strong>{topic}</strong>
        </p>
      </div>

      <div className="toolbar toolbar--between">
        <p className="user-badge">
          Logado como <strong>{authUser?.name || authUser?.nickname || authUser?.email || "Usuario"}</strong>
        </p>
        <div className="toolbar-group">
          <button type="button" className="secondary-button" onClick={onBack}>
            Trocar topico
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onGenerateAnother}
          >
            Gerar outra questao
          </button>
          <button type="button" className="secondary-button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      {isLoading ? <p className="status-text">Gerando questao...</p> : null}
      {error ? <p className="status-text status-text--error">{error}</p> : null}

      {!isLoading && question?.question ? (
        <div className="question-panel">
          <div className="question-statement">
            <span className="question-label">Pergunta</span>
            <p>{question.question}</p>
          </div>

          <div className="answer-list">
            {question.options.map((option) => {
              const isSelected = selectedOptionLabel === option.label;
              const isRightOption = correctOptionLabel === option.label;
              const optionClassName = [
                "answer-button",
                hasAnswered && isRightOption ? "answer-button--correct" : "",
                hasAnswered && isSelected && !isRightOption
                  ? "answer-button--wrong"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={option.label} className="answer-item">
                  <button
                    type="button"
                    className={optionClassName}
                    onClick={() => onSelectOption(option.label)}
                    disabled={hasAnswered}
                  >
                    <span>{option.label}</span>
                    <strong>{option.text}</strong>
                  </button>

                  {hasAnswered ? (
                    <div className="answer-feedback">
                      <p className="answer-feedback__title">
                        {isRightOption
                          ? "Alternativa correta"
                          : "Explicacao da alternativa"}
                      </p>
                      <p>
                        {option.explanation || "Explicacao nao disponivel para esta alternativa."}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {hasAnswered ? (
            <div
              className={`result-banner ${
                isCorrect ? "result-banner--success" : "result-banner--error"
              }`}
            >
              <strong>
                {isCorrect ? "Voce acertou." : "Voce errou."}
              </strong>
              <p>
                {correctOptionLabel
                  ? `Gabarito: ${correctOptionLabel}.`
                  : "A API nao informou a resposta correta."}
              </p>
            </div>
          ) : (
            <p className="status-text">
              Escolha uma alternativa para ver a correcao e as explicacoes.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default QuestionStep;
