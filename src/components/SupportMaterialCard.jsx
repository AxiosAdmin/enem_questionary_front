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

const getVisualMaterialSource = (material) => {
  if (material.publicUrl) {
    return material.publicUrl;
  }

  if (!material.fileBase64) {
    return "";
  }

  if (material.fileBase64.startsWith("data:")) {
    return material.fileBase64;
  }

  return `data:${material.mimeType || "image/png"};base64,${material.fileBase64}`;
};

const renderVisualMaterial = (material) => {
  const imageSource = getVisualMaterialSource(material);

  if (imageSource) {
    return (
      <img
        className="support-visual"
        src={imageSource}
        alt={material.altText || material.caption || formatSupportMaterialTitle(material)}
      />
    );
  }

  return (
    <div className="support-visual support-visual--placeholder">
      <p>
        {material.storageStatus === "pending_storage_configuration"
          ? "Imagem prevista para este material, aguardando configuracao do storage."
          : material.storageStatus === "generation_failed"
            ? "Nao foi possivel carregar a imagem deste material."
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

const renderStructuredDiagram = (material) => {
  if (material.renderingMode === "generated_image") {
    return renderVisualMaterial(material);
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

const SupportMaterialCard = ({ material, children }) => (
  <article className="support-material">
    <div className="support-material__header">
      <span className="question-label">{formatSupportMaterialTitle(material)}</span>
      {material.caption ? <p className="support-material__caption">{material.caption}</p> : null}
    </div>

    {renderSupportMaterialBody(material)}

    {material.sourceLabel ? (
      <p className="support-material__source">{material.sourceLabel}</p>
    ) : null}

    {children}
  </article>
);

export default SupportMaterialCard;
