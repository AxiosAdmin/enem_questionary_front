export const MATERIAL_POSITION_OPTIONS = [
  { value: "before_statement", label: "Antes do enunciado" },
  { value: "after_statement", label: "Depois do enunciado" },
];

export const IMAGE_SOURCE_OPTIONS = [
  { value: "public_url", label: "URL publica" },
  { value: "file_base64", label: "Arquivo em base64" },
  { value: "image_generation_prompt", label: "Prompt de geracao" },
];

export const createSupportMaterialDraft = (id, assetType) => ({
  id,
  assetType,
  position: "before_statement",
  title: "",
  caption: "",
  sourceLabel: "",
  content: "",
  columnsText: "",
  rowsText: "",
  altText: "",
  mimeType: "image/png",
  imageSourceType: "public_url",
  imageSourceValue: "",
});

const trimString = (value) => String(value || "").trim();

const normalizeLines = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const createRequestId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `support-material-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const formatMaterialTypeLabel = (assetType) => {
  switch (assetType) {
    case "text":
      return "Texto";
    case "table":
      return "Tabela";
    case "image":
      return "Imagem";
    default:
      return "Material";
  }
};

const buildSupportMaterialPayload = (material, index) => {
  const basePayload = {
    asset_type: material.assetType,
    position: material.position,
    title: trimString(material.title),
    caption: trimString(material.caption),
    source_label: trimString(material.sourceLabel),
  };

  if (material.assetType === "text") {
    const content = trimString(material.content);

    if (!content) {
      throw new Error(`Preencha o conteudo do material de texto ${index + 1}.`);
    }

    return {
      ...basePayload,
      rendering_mode: "inline_text",
      content,
    };
  }

  if (material.assetType === "table") {
    const columns = normalizeLines(material.columnsText);
    const rowLines = normalizeLines(material.rowsText);
    const rows = rowLines.map((rowLine) =>
      rowLine.split("|").map((cell) => cell.trim()),
    );

    if (!columns.length) {
      throw new Error(`Adicione ao menos uma coluna na tabela ${index + 1}.`);
    }

    if (!rows.length) {
      throw new Error(`Adicione ao menos uma linha na tabela ${index + 1}.`);
    }

    const hasInvalidRow = rows.some(
      (row) => row.length !== columns.length || row.some((cell) => !cell),
    );

    if (hasInvalidRow) {
      throw new Error(
        `Cada linha da tabela ${index + 1} precisa ter ${columns.length} celulas separadas por "|".`,
      );
    }

    return {
      ...basePayload,
      rendering_mode: "structured_data",
      data: {
        columns,
        rows,
      },
    };
  }

  if (material.assetType === "image") {
    const altText = trimString(material.altText);
    const mimeType = trimString(material.mimeType);
    const imageSourceType = trimString(material.imageSourceType);
    const imageSourceValue = trimString(material.imageSourceValue);

    if (!altText) {
      throw new Error(`Adicione um alt_text para a imagem ${index + 1}.`);
    }

    if (!imageSourceValue) {
      throw new Error(`Informe a origem da imagem ${index + 1}.`);
    }

    return {
      ...basePayload,
      rendering_mode: "generated_image",
      alt_text: altText,
      mime_type: mimeType || "image/png",
      [imageSourceType]: imageSourceValue,
    };
  }

  throw new Error(`Tipo de material nao suportado no item ${index + 1}.`);
};

export const buildSupportMaterialsPayload = (supportMaterials) =>
  supportMaterials.map((material, index) => buildSupportMaterialPayload(material, index));

export const buildSupportMaterialsPostPayload = (
  supportMaterials,
  createdAt = new Date().toISOString(),
  requestIdFactory = createRequestId,
) =>
  supportMaterials.map((material, index) => ({
    id: requestIdFactory(material, index),
    ...buildSupportMaterialPayload(material, index),
    display_order: index,
    storage_status: "not_required",
    created_at: createdAt,
  }));
