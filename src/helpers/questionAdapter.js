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

export const extractTopics = (response) => {
  const rawTopics = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.topics)
        ? response.topics
        : [];

  return rawTopics.map(normalizeTopic).filter(Boolean);
};

const getPayload = (response) => {
  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response || {};
};

const getQuestionText = (payload) =>
  pickFirst(payload, ["question", "statement", "prompt", "enunciation"]);

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
  };
};

