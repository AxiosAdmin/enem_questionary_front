export const LOGIN_ROUTE = "/login";
export const REGISTER_ROUTE = "/register";
export const SUBJECTS_ROUTE = "/subjects";
export const CREATE_QUESTION_ROUTE = "/questions";

const trimTrailingSlash = (pathname) =>
  pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;

export const buildTopicsRoute = (subjectId) =>
  `/subjects/${encodeURIComponent(subjectId)}/topics`;

export const buildQuestionRoute = (subjectId, topic, subtopic) =>
  `/subjects/${encodeURIComponent(subjectId)}/topics/${encodeURIComponent(topic)}/subtopics/${encodeURIComponent(subtopic)}/questions`;

export const matchRoute = (pathname) => {
  const normalizedPathname = trimTrailingSlash(pathname || "/");

  if (normalizedPathname === "/") {
    return { name: "root", params: {} };
  }

  if (normalizedPathname === LOGIN_ROUTE) {
    return { name: "login", params: {} };
  }

  if (normalizedPathname === REGISTER_ROUTE) {
    return { name: "register", params: {} };
  }

  if (normalizedPathname === SUBJECTS_ROUTE) {
    return { name: "subjects", params: {} };
  }

  if (normalizedPathname === CREATE_QUESTION_ROUTE) {
    return { name: "create-question", params: {} };
  }

  const topicsMatch = normalizedPathname.match(/^\/subjects\/([^/]+)\/topics$/);

  if (topicsMatch) {
    return {
      name: "topics",
      params: {
        subjectId: decodeURIComponent(topicsMatch[1]),
      },
    };
  }

  const questionMatch = normalizedPathname.match(
    /^\/subjects\/([^/]+)\/topics\/([^/]+)\/subtopics\/([^/]+)\/questions$/,
  );

  if (questionMatch) {
    return {
      name: "questions",
      params: {
        subjectId: decodeURIComponent(questionMatch[1]),
        topic: decodeURIComponent(questionMatch[2]),
        subtopic: decodeURIComponent(questionMatch[3]),
      },
    };
  }

  return { name: "not-found", params: {} };
};
