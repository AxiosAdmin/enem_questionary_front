import { useEffect, useState } from "react";
import { get, post } from "../helpers/FecthApi";
import {
  clearAuthSession,
  getStoredAuthUser,
  isAuthenticated,
} from "../helpers/auth";
import { normalizeQuestion, extractTopics } from "../helpers/questionAdapter";
import { SUBJECTS } from "../helpers/subjects";
import LoginStep from "./LoginStep";
import SubjectSelection from "./SubjectSelection";
import TopicSelection from "./TopicSelection";
import QuestionStep from "./QuestionStep";

const Questions = ({ theme, onToggleTheme }) => {
  const [currentStep, setCurrentStep] = useState(
    isAuthenticated() ? "subjects" : "login",
  );
  const [authUser, setAuthUser] = useState(getStoredAuthUser);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [question, setQuestion] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("");

  const fetchTopics = async (subject) => {
    setTopicsLoading(true);
    setTopicsError("");

    try {
      const data = await get(subject.topicsEndpoint);
      setTopics(extractTopics(data));
    } catch (error) {
      setTopics([]);
      setTopicsError("Nao foi possivel carregar os topicos desta materia.");
    } finally {
      setTopicsLoading(false);
    }
  };

  const fetchQuestion = async (subject, topic) => {
    setCurrentStep("question");
    setQuestionLoading(true);
    setQuestion(null);
    setQuestionError("");
    setSelectedOptionLabel("");

    try {
      const data = await post(subject.questionEndpoint, { topic });
      setQuestion(normalizeQuestion(data));
    } catch (error) {
      setQuestion(null);
      setQuestionError("Nao foi possivel gerar uma questao para este topico.");
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === "topics" && selectedSubject) {
      fetchTopics(selectedSubject);
    }
  }, [currentStep, selectedSubject]);

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedTopic("");
    setQuestion(null);
    setQuestionError("");
    setSelectedOptionLabel("");
    setCurrentStep("topics");
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setSelectedSubject(null);
    setSelectedTopic("");
    setTopics([]);
    setTopicsError("");
    setQuestion(null);
    setQuestionError("");
    setSelectedOptionLabel("");
    setCurrentStep("subjects");
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    fetchQuestion(selectedSubject, topic);
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthUser(null);
    setCurrentStep("login");
    setSelectedSubject(null);
    setSelectedTopic("");
    setTopics([]);
    setTopicsError("");
    setQuestion(null);
    setQuestionError("");
    setSelectedOptionLabel("");
  };

  const handleBackToSubjects = () => {
    setCurrentStep("subjects");
    setSelectedSubject(null);
    setSelectedTopic("");
    setTopics([]);
    setTopicsError("");
    setQuestion(null);
    setQuestionError("");
    setSelectedOptionLabel("");
  };

  const handleBackToTopics = () => {
    setCurrentStep("topics");
    setQuestion(null);
    setQuestionError("");
    setSelectedOptionLabel("");
  };

  const handleGenerateAnotherQuestion = () => {
    if (selectedSubject && selectedTopic) {
      fetchQuestion(selectedSubject, selectedTopic);
    }
  };

  return (
    <main className="questions-shell">
      {currentStep === "login" ? (
        <LoginStep onLoginSuccess={handleLoginSuccess} />
      ) : null}

      {currentStep === "subjects" ? (
        <SubjectSelection
          authUser={authUser}
          onLogout={handleLogout}
          onToggleTheme={onToggleTheme}
          subjects={SUBJECTS}
          theme={theme}
          onSelectSubject={handleSelectSubject}
        />
      ) : null}

      {currentStep === "topics" && selectedSubject ? (
        <TopicSelection
          authUser={authUser}
          subject={selectedSubject}
          topics={topics}
          isLoading={topicsLoading}
          error={topicsError}
          onLogout={handleLogout}
          onBack={handleBackToSubjects}
          onSelectTopic={handleSelectTopic}
        />
      ) : null}

      {currentStep === "question" && selectedSubject ? (
        <QuestionStep
          authUser={authUser}
          subject={selectedSubject}
          topic={selectedTopic}
          question={question}
          isLoading={questionLoading}
          error={questionError}
          onLogout={handleLogout}
          selectedOptionLabel={selectedOptionLabel}
          onSelectOption={setSelectedOptionLabel}
          onBack={handleBackToTopics}
          onGenerateAnother={handleGenerateAnotherQuestion}
        />
      ) : null}
    </main>
  );
};

export default Questions;
