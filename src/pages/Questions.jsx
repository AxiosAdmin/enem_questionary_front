import { useEffect, useState } from "react";
import { post } from "../helpers/FecthApi";
import { normalizeQuestion } from "../helpers/questionAdapter";

const formatSupportMaterialTitle = (material) => {
  if (material.title) {
    return material.title;
  }

  switch (material.assetType) {
    case "text":
      return "Texto de apoio";
    case "table":
      return "Tabela";
    case "chart":
      return "Grafico";
    case "image":
      return "Imagem";
    case "map":
      return "Mapa";
    case "diagram":
      return "Diagrama";
    case "infographic":
      return "Infografico";
    default:
      return "Material de apoio";
  }
};

const getChartEntries = (data) => {
  const labels = Array.isArray(data?.labels) ? data.labels : [];
  const series = Array.isArray(data?.series) ? data.series : [];
  const entries = [];

  series.forEach((seriesItem, seriesIndex) => {
    const values = Array.isArray(seriesItem?.values) ? seriesItem.values : [];
    const seriesName = seriesItem?.name || `Serie ${seriesIndex + 1}`;

    values.forEach((value, valueIndex) => {
      const numericValue = Number(value);

      if (Number.isNaN(numericValue)) {
        return;
      }

      entries.push({
        id: `${seriesName}-${valueIndex}`,
        label: labels[valueIndex] || `Item ${valueIndex + 1}`,
        seriesName,
        value: numericValue,
      });
    });
  });

  return entries;
};

const renderStructuredTable = (material) => {
  const columns = Array.isArray(material.data?.columns) ? material.data.columns : [];
  const rows = Array.isArray(material.data?.rows) ? material.data.rows : [];

  if (!columns.length && !rows.length) {
    return null;
  }

  return (
    <div className="support-table-wrapper">
      <table className="support-table">
        {columns.length ? (
          <thead>
            <tr>
              {columns.map((column, columnIndex) => (
                <th key={`${material.id}-column-${columnIndex}`}>{column}</th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${material.id}-row-${rowIndex}`}>
              {Array.isArray(row)
                ? row.map((cell, cellIndex) => (
                    <td key={`${material.id}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                  ))
                : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderStructuredChart = (material) => {
  const entries = getChartEntries(material.data);
  const peakValue = Math.max(...entries.map((entry) => entry.value), 0);

  if (!entries.length) {
    return null;
  }

  return (
    <div className="support-chart">
      <div className="support-chart__bars">
        {entries.map((entry) => {
          const widthPercentage = peakValue > 0 ? (entry.value / peakValue) * 100 : 0;

          return (
            <div key={entry.id} className="support-chart__row">
              <div className="support-chart__labels">
                <span className="support-chart__label">{entry.label}</span>
                <span className="support-chart__series">{entry.seriesName}</span>
              </div>
              <div className="support-chart__track">
                <div
                  className="support-chart__bar"
                  style={{ width: `${Math.max(widthPercentage, 6)}%` }}
                />
              </div>
              <strong className="support-chart__value">{entry.value}</strong>
            </div>
          );
        })}
      </div>

      {renderStructuredTable({
        ...material,
        data: {
          columns:
            material.data?.series?.length > 1
              ? ["Rotulo", "Serie", "Valor"]
              : ["Rotulo", "Valor"],
          rows: entries.map((entry) =>
            material.data?.series?.length > 1
              ? [entry.label, entry.seriesName, entry.value]
              : [entry.label, entry.value],
          ),
        },
      })}
    </div>
  );
};

const renderStructuredDiagram = (material) => {
  if (material.renderingMode === "generated_image") {
    return renderVisualMaterial(material);
  }

  const diagramType = material.data?.diagram_type;

  if (diagramType === "rectangle_dimensions") {
    const widthLabel = material.data?.width_label || "Largura";
    const heightLabel = material.data?.height_label || "Altura";
    const scaleLabel = material.data?.scale_label || "";

    return (
      <div className="support-diagram">
        <svg
          className="support-diagram__svg"
          viewBox="0 0 320 220"
          role="img"
          aria-label={material.altText || material.caption || formatSupportMaterialTitle(material)}
        >
          <rect
            x="70"
            y="45"
            width="180"
            height="110"
            rx="4"
            fill="rgba(37, 99, 235, 0.08)"
            stroke="currentColor"
            strokeWidth="3"
          />

          <line x1="70" y1="170" x2="250" y2="170" stroke="currentColor" strokeWidth="2" />
          <line x1="70" y1="164" x2="70" y2="176" stroke="currentColor" strokeWidth="2" />
          <line x1="250" y1="164" x2="250" y2="176" stroke="currentColor" strokeWidth="2" />
          <text x="160" y="192" textAnchor="middle" className="support-diagram__text">
            {widthLabel}
          </text>

          <line x1="42" y1="45" x2="42" y2="155" stroke="currentColor" strokeWidth="2" />
          <line x1="36" y1="45" x2="48" y2="45" stroke="currentColor" strokeWidth="2" />
          <line x1="36" y1="155" x2="48" y2="155" stroke="currentColor" strokeWidth="2" />
          <text
            x="24"
            y="104"
            textAnchor="middle"
            className="support-diagram__text"
            transform="rotate(-90 24 104)"
          >
            {heightLabel}
          </text>

          {scaleLabel ? (
            <text x="160" y="28" textAnchor="middle" className="support-diagram__text">
              Escala: {scaleLabel}
            </text>
          ) : null}
        </svg>

        {material.altText ? (
          <p className="support-material__alt">
            <strong>Descricao:</strong> {material.altText}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="support-visual support-visual--placeholder">
      <p>Diagrama estruturado sem renderer especifico no front.</p>
      {material.altText ? (
        <p className="support-material__alt">
          <strong>Descricao:</strong> {material.altText}
        </p>
      ) : null}
    </div>
  );
};

const renderVisualMaterial = (material) => {
  if (material.publicUrl) {
    return (
      <img
        className="support-visual"
        src={material.publicUrl}
        alt={material.altText || material.caption || formatSupportMaterialTitle(material)}
      />
    );
  }

  return (
    <div className="support-visual support-visual--placeholder">
      <p>
        {material.storageStatus === "pending_storage_configuration"
          ? "Imagem prevista para esta questao, aguardando configuracao do storage."
          : material.storageStatus === "generation_failed"
            ? "Nao foi possivel carregar a imagem desta questao."
            : "Imagem de apoio nao disponivel no momento."}
      </p>
      {material.altText ? (
        <p className="support-material__alt">
          <strong>Descricao:</strong> {material.altText}
        </p>
      ) : null}
    </div>
  );
};

const renderSupportMaterialBody = (material) => {
  if (material.assetType === "text") {
    return <p className="support-material__content">{material.content}</p>;
  }

  if (material.assetType === "table") {
    return renderStructuredTable(material);
  }

  if (material.assetType === "chart") {
    return renderStructuredChart(material);
  }

  if (material.assetType === "diagram") {
    return renderStructuredDiagram(material);
  }

  if (["image", "map", "infographic"].includes(material.assetType)) {
    return renderVisualMaterial(material);
  }

  return null;
};

const SupportMaterialCard = ({ material }) => (
  <article className="support-material">
    <div className="support-material__header">
      <span className="question-label">{formatSupportMaterialTitle(material)}</span>
      {material.caption ? <p className="support-material__caption">{material.caption}</p> : null}
    </div>

    {renderSupportMaterialBody(material)}

    {material.sourceLabel ? (
      <p className="support-material__source">{material.sourceLabel}</p>
    ) : null}
  </article>
);

const Questions = ({ authUser, subject, topic, subtopic, onBack, onLogout }) => {
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
