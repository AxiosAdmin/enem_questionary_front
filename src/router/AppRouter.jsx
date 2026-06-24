import { useCallback, useEffect, useState } from "react";
import {
  clearAuthSession,
  getStoredAuthUser,
  isAuthenticated,
  registerSessionExpiredHandler,
} from "../helpers/auth";
import { getSubjectById } from "../helpers/subjects";
import Login from "../pages/Login";
import ManualQuestionCreate from "../pages/ManualQuestionCreate";
import Questions from "../pages/Questions";
import Register from "../pages/Register";
import SupportMaterialQuestionCreate from "../pages/SupportMaterialQuestionCreate";
import SubjectsMenu from "../pages/SubjectsMenu";
import SupportMaterialsCreate from "../pages/SupportMaterialsCreate";
import TopicsMenu from "../pages/TopicsMenu";
import {
  CREATE_SUPPORT_MATERIAL_QUESTION_ROUTE,
  CREATE_SUPPORT_MATERIAL_ROUTE,
  CREATE_QUESTION_ROUTE,
  LOGIN_ROUTE,
  REGISTER_ROUTE,
  SUBJECTS_ROUTE,
  buildQuestionRoute,
  buildTopicsRoute,
  matchRoute,
} from "./routes";

const getCurrentPathname = () =>
  typeof window !== "undefined" ? window.location.pathname || "/" : "/";

const replacePathname = (pathname) => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.replaceState({}, "", pathname);
};

const pushPathname = (pathname) => {
  if (typeof window === "undefined") {
    return;
  }

  window.history.pushState({}, "", pathname);
};

const AppRouter = ({ theme, onToggleTheme }) => {
  const [pathname, setPathname] = useState(getCurrentPathname);
  const [authUser, setAuthUser] = useState(getStoredAuthUser);
  const [showSessionExpiredFlag, setShowSessionExpiredFlag] = useState(false);

  const navigate = useCallback((nextPathname, replace = false) => {
    if (nextPathname === pathname) {
      return;
    }

    if (replace) {
      replacePathname(nextPathname);
    } else {
      pushPathname(nextPathname);
    }

    setPathname(nextPathname);
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(getCurrentPathname());
    };

    const handleSessionExpired = () => {
      clearAuthSession();
      setAuthUser(null);
      setShowSessionExpiredFlag(true);
      navigate(LOGIN_ROUTE, true);
    };

    registerSessionExpiredHandler(handleSessionExpired);
    window.addEventListener("popstate", handlePopState);

    return () => {
      registerSessionExpiredHandler(null);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const isLoggedIn = isAuthenticated();
  const matchedRoute = matchRoute(pathname);
  const requestedSubjectId = matchedRoute.params.subjectId || "";
  const requestedSubject =
    requestedSubjectId && ["topics", "questions"].includes(matchedRoute.name)
      ? getSubjectById(requestedSubjectId)
      : null;

  let resolvedPathname = pathname;

  if (matchedRoute.name === "root") {
    resolvedPathname = isLoggedIn ? SUBJECTS_ROUTE : LOGIN_ROUTE;
  } else if (!isLoggedIn && !["login", "register"].includes(matchedRoute.name)) {
    resolvedPathname = LOGIN_ROUTE;
  } else if (isLoggedIn && ["login", "register"].includes(matchedRoute.name)) {
    resolvedPathname = SUBJECTS_ROUTE;
  } else if (
    ["topics", "questions"].includes(matchedRoute.name) &&
    !requestedSubject
  ) {
    resolvedPathname = SUBJECTS_ROUTE;
  } else if (matchedRoute.name === "not-found") {
    resolvedPathname = isLoggedIn ? SUBJECTS_ROUTE : LOGIN_ROUTE;
  }

  const route = matchRoute(resolvedPathname);
  const subject =
    route.params.subjectId && ["topics", "questions"].includes(route.name)
      ? getSubjectById(route.params.subjectId)
      : null;

  useEffect(() => {
    if (resolvedPathname !== pathname) {
      replacePathname(resolvedPathname);
      setPathname(resolvedPathname);
    }
  }, [pathname, resolvedPathname]);

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setShowSessionExpiredFlag(false);
    navigate(SUBJECTS_ROUTE, true);
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthUser(null);
    setShowSessionExpiredFlag(false);
    navigate(LOGIN_ROUTE, true);
  };

  const sessionExpiredFlag = showSessionExpiredFlag ? (
    <aside className="session-expired-flag" role="status" aria-live="polite">
      Sua sessao expirou, faca login novamente
    </aside>
  ) : null;

  if (route.name === "login") {
    return (
      <>
        {sessionExpiredFlag}
        <Login
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => navigate(REGISTER_ROUTE)}
        />
      </>
    );
  }

  if (route.name === "register") {
    return (
      <>
        {sessionExpiredFlag}
        <Register onNavigateToLogin={() => navigate(LOGIN_ROUTE)} />
      </>
    );
  }

  if (route.name === "subjects") {
    return (
      <>
        {sessionExpiredFlag}
        <SubjectsMenu
          authUser={authUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onCreateQuestion={() => navigate(CREATE_QUESTION_ROUTE)}
          onCreateQuestionWithSupportMaterial={() =>
            navigate(CREATE_SUPPORT_MATERIAL_QUESTION_ROUTE)
          }
          onCreateSupportMaterials={() => navigate(CREATE_SUPPORT_MATERIAL_ROUTE)}
          onLogout={handleLogout}
          onSelectSubject={(selectedSubject) =>
            navigate(buildTopicsRoute(selectedSubject.id))
          }
        />
      </>
    );
  }

  if (route.name === "create-question") {
    return (
      <>
        {sessionExpiredFlag}
        <ManualQuestionCreate
          authUser={authUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onBack={() => navigate(SUBJECTS_ROUTE)}
          onLogout={handleLogout}
        />
      </>
    );
  }

  if (route.name === "create-support-material") {
    return (
      <>
        {sessionExpiredFlag}
        <SupportMaterialsCreate
          authUser={authUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onBack={() => navigate(SUBJECTS_ROUTE)}
          onLogout={handleLogout}
        />
      </>
    );
  }

  if (route.name === "create-question-with-support-materials") {
    return (
      <>
        {sessionExpiredFlag}
        <SupportMaterialQuestionCreate
          authUser={authUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onBack={() => navigate(SUBJECTS_ROUTE)}
          onLogout={handleLogout}
        />
      </>
    );
  }

  if (route.name === "topics" && subject) {
    return (
      <>
        {sessionExpiredFlag}
        <TopicsMenu
          authUser={authUser}
          subject={subject}
          onBack={() => navigate(SUBJECTS_ROUTE)}
          onLogout={handleLogout}
          onSelectTopicSelection={({ topic, subtopic }) =>
            navigate(buildQuestionRoute(subject.id, topic, subtopic))
          }
        />
      </>
    );
  }

  if (route.name === "questions" && subject) {
    return (
      <>
        {sessionExpiredFlag}
        <Questions
          authUser={authUser}
          subject={subject}
          topic={route.params.topic}
          subtopic={route.params.subtopic}
          onBack={() => navigate(buildTopicsRoute(subject.id))}
          onLogout={handleLogout}
        />
      </>
    );
  }

  return null;
};

export default AppRouter;
