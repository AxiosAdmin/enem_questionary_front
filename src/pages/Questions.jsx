import { useEffect, useState } from "react";
import QuestionViewer from "../components/QuestionViewer";
import { post } from "../helpers/FecthApi";
import { normalizeQuestion } from "../helpers/questionAdapter";

const Questions = ({ authUser, subject, topic, subtopic, onBack, onLogout }) => {
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const resetQuestionState = () => {
    setIsLoading(true);
    setQuestion(null);
    setError("");
  };

  const requestQuestion = async (currentSubject, currentTopic, currentSubtopic) => {
    const data = await post(currentSubject.questionEndpoint, {
      topic: currentTopic,
      subtopic: currentSubtopic,
    });
    return normalizeQuestion(data);
  };

  const handleRequestError = () => {
    setQuestion(null);
    setError("Nao foi possivel gerar uma questao para este topico e subtopico.");
  };

  const handleGenerateAnother = async () => {
    resetQuestionState();

    try {
      const nextQuestion = await requestQuestion(subject, topic, subtopic);
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
        const nextQuestion = await requestQuestion(subject, topic, subtopic);

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
  }, [subject, subtopic, topic]);

  return (
    <main className="questions-shell">
      <section className="screen-card fade-in">
        <div className="screen-header">
          <h1>{subject.title}</h1>
          <p>
            Topico selecionado: <strong>{topic}</strong>
          </p>
          <p>
            Subtopico selecionado: <strong>{subtopic}</strong>
          </p>
        </div>

        <div className="toolbar toolbar--between">
          <p className="user-badge">
            Logado como{" "}
            <strong>{authUser?.name || authUser?.nickname || authUser?.email || "Usuario"}</strong>
          </p>
          <div className="toolbar-group">
            <button type="button" className="secondary-button" onClick={onBack}>
              Trocar topico e subtopico
            </button>
            <button type="button" className="primary-button" onClick={handleGenerateAnother}>
              Gerar outra questao
            </button>
            <button type="button" className="secondary-button bg-danger" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>

        {isLoading ? <p className="status-text">Gerando questao...</p> : null}
        {error ? <p className="status-text status-text--error">{error}</p> : null}

        {!isLoading && question?.question ? <QuestionViewer question={question} /> : null}
      </section>
    </main>
  );
};

export default Questions;
