const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const pickFirst = (source, keys) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null && source?.[key] !== "") {
      return source[key];
    }
  }

  return "";
};

const normalizeTopic = (topic) => {
  if (typeof topic === "string") {
    return topic;
  }

  if (typeof topic === "object" && topic !== null) {
    return (
      topic.name ||
      topic.title ||
      topic.topic ||
      topic.label ||
      ""
    );
  }

  return "";
};

const normalizeSubtopic = (subtopic) => {
  if (typeof subtopic === "string") {
    return {
      name: subtopic,
      description: "",
    };
  }

  if (typeof subtopic === "object" && subtopic !== null) {
    return {
      name:
        subtopic.name ||
        subtopic.title ||
        subtopic.subtopic ||
        subtopic.label ||
        "",
      description:
        subtopic.description ||
        subtopic.subtopic_description ||
        subtopic.subtopicDescription ||
        "",
    };
  }

  return {
    name: "",
    description: "",
  };
};

const getRawTopics = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.topics)) {
    return response.topics;
  }

  return [];
};

export const extractTopicCatalog = (response) =>
  getRawTopics(response)
    .map((topicEntry) => {
      const topic = normalizeTopic(topicEntry);
      const rawSubtopics = Array.isArray(topicEntry?.subtopics)
        ? topicEntry.subtopics
        : Array.isArray(topicEntry?.children)
          ? topicEntry.children
          : Array.isArray(topicEntry?.items)
            ? topicEntry.items
            : [];

      return {
        topic,
        subtopics: rawSubtopics.map(normalizeSubtopic).filter((subtopic) => subtopic.name),
      };
    })
    .filter((topicEntry) => topicEntry.topic);

export const extractTopics = (response) => {
  return extractTopicCatalog(response).map((topicEntry) => topicEntry.topic);
};

const getPayload = (response) => {
  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response || {};
};

const getQuestionText = (payload) =>
  pickFirst(payload, ["question", "statement", "prompt", "enunciation"]);

const normalizeString = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
};

const normalizeNumber = (value, fallback = 0) => {
  if (value === "" || value === undefined || value === null) {
    return fallback;
  }

  const candidate = Number(value);
  return Number.isFinite(candidate) ? candidate : fallback;
};

const getOptionText = (payload, label) => {
  const lowerLabel = label.toLowerCase();

  return pickFirst(payload, [
    `answer_${lowerLabel}`,
    `option_${lowerLabel}`,
    `alternative_${lowerLabel}`,
    `answer${label}`,
    `option${label}`,
    `alternative${label}`,
  ]);
};

const getOptionExplanation = (payload, label) => {
  const lowerLabel = label.toLowerCase();

  return pickFirst(payload, [
    `explanation_${lowerLabel}`,
    `answer_${lowerLabel}_explanation`,
    `option_${lowerLabel}_explanation`,
    `alternative_${lowerLabel}_explanation`,
    `justification_${lowerLabel}`,
    `reason_${lowerLabel}`,
  ]);
};

const buildOptionsFromArray = (rawOptions) =>
  rawOptions
    .map((option, index) => {
      const label = String(
        option?.label ||
          option?.letter ||
          option?.key ||
          OPTION_LABELS[index] ||
          "",
      ).toUpperCase();

      const text =
        typeof option === "string"
          ? option
          : option?.text || option?.answer || option?.option || option?.alternative || "";

      return {
        label,
        text,
        explanation: option?.explanation || option?.justification || option?.reason || "",
        isCorrect: Boolean(option?.isCorrect || option?.correct),
      };
    })
    .filter((option) => option.label && option.text);

const buildOptionsFromPayload = (payload) =>
  OPTION_LABELS.map((label) => ({
    label,
    text: getOptionText(payload, label),
    explanation: getOptionExplanation(payload, label),
    isCorrect: false,
  })).filter((option) => option.text);

const normalizeCandidateValue = (value) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const resolveCorrectOptionLabel = (options, payload) => {
  const candidate = normalizeCandidateValue(
    pickFirst(payload, [
      "correct_answer",
      "correctAnswer",
      "correct_option",
      "correctOption",
      "correct_alternative",
      "correctAlternative",
      "right_answer",
      "rightAnswer",
      "answer_correct",
      "answerCorrect",
    ]),
  );

  if (typeof candidate === "number" && options[candidate]) {
    return options[candidate].label;
  }

  if (typeof candidate === "string" && candidate) {
    const normalizedCandidate = candidate.toUpperCase();
    const byLabel = options.find((option) => option.label === normalizedCandidate);

    if (byLabel) {
      return byLabel.label;
    }

    const byText = options.find(
      (option) => option.text.trim().toLowerCase() === candidate.toLowerCase(),
    );

    if (byText) {
      return byText.label;
    }
  }

  const flaggedOption = options.find((option) => option.isCorrect);
  return flaggedOption?.label || "";
};

export const normalizeSupportMaterial = (material, index) => {
  const rawData =
    material?.data && typeof material.data === "object" && !Array.isArray(material.data)
      ? material.data
      : {};

  return {
    id: material?.id || `support-material-${index}`,
    assetType: normalizeString(material?.asset_type || material?.assetType).toLowerCase(),
    renderingMode: normalizeString(
      material?.rendering_mode || material?.renderingMode,
    ).toLowerCase(),
    position: normalizeString(material?.position || "before_statement").toLowerCase(),
    displayOrder: Number(material?.display_order ?? material?.displayOrder ?? index) || index,
    storageStatus: normalizeString(
      material?.storage_status || material?.storageStatus || "not_required",
    ).toLowerCase(),
    title: normalizeString(material?.title),
    caption: normalizeString(material?.caption),
    altText: normalizeString(material?.alt_text || material?.altText),
    sourceLabel: normalizeString(material?.source_label || material?.sourceLabel),
    content: normalizeString(material?.content),
    storageProvider: normalizeString(
      material?.storage_provider || material?.storageProvider,
    ),
    storageKey: normalizeString(material?.storage_key || material?.storageKey),
    publicUrl: normalizeString(material?.public_url || material?.publicUrl),
    fileBase64: normalizeString(material?.file_base64 || material?.fileBase64),
    imageGenerationPrompt: normalizeString(
      material?.image_generation_prompt || material?.imageGenerationPrompt,
    ),
    mimeType: normalizeString(material?.mime_type || material?.mimeType),
    data: rawData,
  };
};

const getSupportMaterials = (payload) => {
  const rawSupportMaterials = Array.isArray(payload?.support_materials)
    ? payload.support_materials
    : Array.isArray(payload?.supportMaterials)
      ? payload.supportMaterials
      : [];

  return rawSupportMaterials
    .map(normalizeSupportMaterial)
    .sort((first, second) => first.displayOrder - second.displayOrder);
};

const getRawSupportMaterialsList = (response) => {
  const payload = getPayload(response);

  return Array.isArray(response)
    ? response
    : Array.isArray(payload?.support_materials)
      ? payload.support_materials
      : Array.isArray(payload?.supportMaterials)
        ? payload.supportMaterials
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.materials)
          ? payload.materials
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
};

const getPaginationPayload = (response) => {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    return response;
  }

  return {};
};

export const normalizeSupportMaterialsResponse = (response) => {
  const rawSupportMaterials = getRawSupportMaterialsList(response);

  return rawSupportMaterials
    .map(normalizeSupportMaterial)
    .sort((first, second) => first.displayOrder - second.displayOrder);
};

export const normalizeSupportMaterialsPage = (response, options = {}) => {
  const payload = getPaginationPayload(getPayload(response));
  const items = normalizeSupportMaterialsResponse(response);
  const currentPage = Math.max(
    1,
    normalizeNumber(
      pickFirst(payload, ["page", "current_page", "currentPage", "page_number", "pageNumber"]),
      normalizeNumber(options.fallbackCurrentPage, 1),
    ),
  );
  const itemsPerPage = Math.max(
    items.length || 1,
    normalizeNumber(
      pickFirst(payload, [
        "items_per_page",
        "itemsPerPage",
        "page_size",
        "pageSize",
        "per_page",
        "perPage",
      ]),
      normalizeNumber(options.fallbackItemsPerPage, items.length || 1),
    ),
  );
  const totalItems = Math.max(
    items.length,
    normalizeNumber(
      pickFirst(payload, [
        "total_count",
        "totalCount",
        "total_items",
        "totalItems",
        "total",
        "count",
        ]),
      items.length,
    ),
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage) || 1,
  );
  const hasMore = Boolean(
    pickFirst(payload, ["has_more", "hasMore"]) === true ||
      normalizeString(pickFirst(payload, ["has_more", "hasMore"])).toLowerCase() === "true",
  );

  return {
    items,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    hasMore,
  };
};

export const normalizeQuestion = (response) => {
  const payload = getPayload(response);
  const question = getQuestionText(payload);
  const arrayOptions = Array.isArray(payload?.alternatives)
    ? payload.alternatives
    : Array.isArray(payload?.options)
      ? payload.options
      : [];
  const options =
    arrayOptions.length > 0
      ? buildOptionsFromArray(arrayOptions)
      : buildOptionsFromPayload(payload);

  return {
    question,
    options,
    correctOptionLabel: resolveCorrectOptionLabel(options, payload),
    supportMaterials: getSupportMaterials(payload),
  };
};
