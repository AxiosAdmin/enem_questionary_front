import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LOCALES,
  SUPPORTED_LANGUAGES,
  translations,
} from "./translations";

const AppContext = createContext();

export const resolveLanguage = (language) =>
  SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;

export const resolveLocale = (language) =>
  LANGUAGE_LOCALES[language] || LANGUAGE_LOCALES.en;

const getStoredAuthUser = () => {
  try {
    const storedUser = localStorage.getItem('auth_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
};

const getStoredSelectedInstitution = () => {
  try {
    const storedInstitution = localStorage.getItem("selected_institution");
    return storedInstitution ? JSON.parse(storedInstitution) : null;
  } catch {
    localStorage.removeItem("selected_institution");
    return null;
  }
};

const getStoredQuestionGenerationUsage = () => {
  try {
    const storedUsage = localStorage.getItem("question_generation_usage");
    return storedUsage ? JSON.parse(storedUsage) : null;
  } catch {
    localStorage.removeItem("question_generation_usage");
    return null;
  }
};

const getStoredLanguage = () => {
  try {
    const storedLanguage = localStorage.getItem("language");
    return resolveLanguage(storedLanguage);
  } catch {
    localStorage.removeItem("language");
    return DEFAULT_LANGUAGE;
  }
};

const userHasSubscriptionAccess = (user) => {
  if (!user) {
    return false;
  }

  if (user.global_role === "Admin") {
    return true;
  }

  return Boolean(user.institution_id || user.institution?.id);
};

export const isQuestionPackageExhausted = (usage) => {
  if (!usage) {
    return false;
  }

  if (typeof usage.questions_remaining === "number") {
    return usage.questions_remaining <= 0;
  }

  if (typeof usage.questions_limit === "number") {
    return (usage.questions_used || 0) >= usage.questions_limit;
  }

  return false;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentArea, setCurrentArea] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questionData, setQuestionData] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState(getStoredAuthUser);
  const [selectedInstitution, setSelectedInstitutionState] = useState(getStoredSelectedInstitution);
  const [questionGenerationUsage, setQuestionGenerationUsageState] = useState(
    getStoredQuestionGenerationUsage,
  );
  const [language, setLanguageState] = useState(getStoredLanguage);
  const [hasSubscriptionAccess, setHasSubscriptionAccess] = useState(() =>
    userHasSubscriptionAccess(getStoredAuthUser()),
  );
  const hasQuestionPackageAvailable =
    authUser?.global_role === "Admin" ||
    !isQuestionPackageExhausted(questionGenerationUsage);

  const setLanguage = (nextLanguage) => {
    const resolvedLanguage = resolveLanguage(nextLanguage);
    localStorage.setItem("language", resolvedLanguage);
    setLanguageState(resolvedLanguage);
  };

  const t = useCallback((key, variables = {}) => {
    const template =
      translations[language]?.[key] ?? translations.en[key] ?? key;

    return Object.entries(variables).reduce(
      (message, [variableKey, variableValue]) =>
        message.replaceAll(`{${variableKey}}`, String(variableValue)),
      template,
    );
  }, [language]);

  const getLocale = useCallback(
    () => resolveLocale(language),
    [language],
  );

  const formatDate = (value, options) => {
    if (!value) {
      return null;
    }

    return new Date(value).toLocaleDateString(
      getLocale(),
      options || {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    );
  };

  const formatDateTime = (value, options) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString(getLocale(), options);
  };

  const setSelectedInstitution = (institution) => {
    if (institution) {
      localStorage.setItem("selected_institution", JSON.stringify(institution));
    } else {
      localStorage.removeItem("selected_institution");
    }

    setSelectedInstitutionState(institution);
  };

  const getCurrentUserId = () => {
    return authUser?.user_id || authUser?.id || null;
  };

  const setQuestionGenerationUsage = (usage) => {
    if (usage) {
      localStorage.setItem("question_generation_usage", JSON.stringify(usage));
    } else {
      localStorage.removeItem("question_generation_usage");
    }

    setQuestionGenerationUsageState(usage);
  };

  const incrementQuestionGenerationUsage = () => {
    setQuestionGenerationUsageState((currentUsage) => {
      if (!currentUsage) {
        const nextUsage = {
          questions_used: 1,
          questions_limit: null,
          questions_remaining: null,
          cycle_end: null,
          subscription_status: null,
        };
        localStorage.setItem("question_generation_usage", JSON.stringify(nextUsage));
        return nextUsage;
      }

      const nextUsage = {
        ...currentUsage,
        questions_used: (currentUsage.questions_used || 0) + 1,
        questions_remaining:
          typeof currentUsage.questions_remaining === "number"
            ? Math.max(currentUsage.questions_remaining - 1, 0)
            : currentUsage.questions_remaining,
      };
      localStorage.setItem("question_generation_usage", JSON.stringify(nextUsage));
      return nextUsage;
    });
  };

  const login = (user, token, usage = null) => {
    localStorage.setItem("auth_user", JSON.stringify(user));
    if (token) {
      localStorage.setItem("token", token);
    }
    localStorage.removeItem("selected_institution");
    setAuthUser(user);
    setSelectedInstitutionState(null);
    setHasSubscriptionAccess(userHasSubscriptionAccess(user));
    setQuestionGenerationUsage(usage);
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("token");
    localStorage.removeItem("selected_institution");
    localStorage.removeItem("question_generation_usage");
    setAuthUser(null);
    setSelectedInstitutionState(null);
    setHasSubscriptionAccess(false);
    setQuestionGenerationUsageState(null);
    setCurrentArea(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuestionData(null);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  useEffect(() => {
    window.addEventListener("auth:logout", logout);
    return () => window.removeEventListener("auth:logout", logout);
  }, []);

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const resetQuestionData = () => {
    setQuestionData(null);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const value = {
    currentArea,
    setCurrentArea,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    questionData,
    setQuestionData,
    selectedAnswer,
    setSelectedAnswer,
    showResult,
    setShowResult,
    isLoading,
    setIsLoading,
    resetQuestionState,
    resetQuestionData,
    authUser,
    setAuthUser,
    getCurrentUserId,
    questionGenerationUsage,
    setQuestionGenerationUsage,
    incrementQuestionGenerationUsage,
    selectedInstitution,
    setSelectedInstitution,
    isAuthenticated: Boolean(authUser),
    hasSelectedInstitution: Boolean(selectedInstitution),
    hasSubscriptionAccess,
    hasQuestionPackageAvailable,
    login,
    logout,
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    t,
    formatDate,
    formatDateTime,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
