import { useEffect, useState } from "react";
import { post } from "../helpers/FecthApi";
import { normalizeQuestion } from "../helpers/questionAdapter";

const Questions = ({ authUser, subject, topic, onBack, onLogout }) => {
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("");

  const resetQuestionState = () => {
    setIsLoading(true);
    setQuestion(null);
    setError("");
    setSelectedOptionLabel("");
  };

  const requestQuestion = async (currentSubject, currentTopic) => {
    const data = await post(currentSubject.questionEndpoint, { topic: currentTopic });
    return normalizeQuestion(data);
  };

  const handleRequestError = () => {
    setQuestion(null);
    setError("Nao foi possivel gerar uma questao para este topico.");
  };

  const handleGenerateAnother = async () => {
    resetQuestionState();

    try {
      const nextQuestion = await requestQuestion(subject, topic);
      setQuestion(nextQuestion);
    } catch (requestError) {
      handleRequestError();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadQuestion = async () => {
      resetQuestionState();

      try {
        const nextQuestion = await requestQuestion(subject, topic);

        if (!isMounted) {
          return;
        }

        setQuestion(nextQuestion);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        handleRequestError();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadQuestion();

    return () => {
      isMounted = false;
    };
  }, [subject, topic]);

  const hasAnswered = Boolean(selectedOptionLabel);
  const correctOptionLabel = question?.correctOptionLabel || "";
  const isCorrect = hasAnswered && selectedOptionLabel === correctOptionLabel;

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>{subject.title}</h1>
          <p>
            Topico selecionado: <strong>{topic}</strong>
          </p>
        </div>

        <div className="toolbar toolbar--between">
          <p className="user-badge">
            Logado como{" "}
            <strong>{authUser?.name || authUser?.nickname || authUser?.email || "Usuario"}</strong>
          </p>
          <div className="toolbar-group">
            <button type="button" className="secondary-button" onClick={onBack}>
              Trocar topico
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleGenerateAnother}
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
                      onClick={() => setSelectedOptionLabel(option.label)}
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
                          {option.explanation ||
                            "Explicacao nao disponivel para esta alternativa."}
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
                <strong>{isCorrect ? "Voce acertou." : "Voce errou."}</strong>
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
    </main>
  );
};

export default Questions;
