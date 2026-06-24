import { useEffect, useState } from "react";
import SupportMaterialCard from "./SupportMaterialCard";

const QuestionViewer = ({ question }) => {
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("");

  useEffect(() => {
    setSelectedOptionLabel("");
  }, [question?.question, question?.correctOptionLabel]);

  if (!question?.question) {
    return null;
  }

  const hasAnswered = Boolean(selectedOptionLabel);
  const correctOptionLabel = question?.correctOptionLabel || "";
  const isCorrect = hasAnswered && selectedOptionLabel === correctOptionLabel;
  const supportMaterials = Array.isArray(question?.supportMaterials)
    ? question.supportMaterials
    : [];
  const materialsBeforeStatement = supportMaterials.filter(
    (material) => material.position !== "after_statement",
  );
  const materialsAfterStatement = supportMaterials.filter(
    (material) => material.position === "after_statement",
  );

  return (
    <div className="question-panel">
      {materialsBeforeStatement.length ? (
        <div className="support-materials">
          {materialsBeforeStatement.map((material) => (
            <SupportMaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : null}

      <div className="question-statement">
        <span className="question-label">Pergunta</span>
        <p>{question.question}</p>
      </div>

      {materialsAfterStatement.length ? (
        <div className="support-materials">
          {materialsAfterStatement.map((material) => (
            <SupportMaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : null}

      <div className="answer-list">
        {question.options.map((option) => {
          const isSelected = selectedOptionLabel === option.label;
          const isRightOption = correctOptionLabel === option.label;
          const optionClassName = [
            "answer-button",
            hasAnswered && isRightOption ? "answer-button--correct" : "",
            hasAnswered && isSelected && !isRightOption ? "answer-button--wrong" : "",
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
                    {isRightOption ? "Alternativa correta" : "Explicacao da alternativa"}
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
  );
};

export default QuestionViewer;
