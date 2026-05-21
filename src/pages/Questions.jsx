import { useEffect, useState } from "react";
import { get, post } from "../helpers/FecthApi";

const Questions = () => {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState({});

  const getQuestion = async (topic) => {
    const data = await post("ai/math", { topic: topic });
    setQuestions(data);
  };

  const getTopics = async () => {
    const data = await get("ai/math/topics");
    setTopics(data.data);
  };

  useEffect(() => {
    getTopics();
  }, []);

  return (
    <div className="questions">
      <span>Topics:</span>
      <div>
        {topics.length > 0 ? topics.map((topic) => (
          <button key={topic} onClick={() => getQuestion(topic)}>{topic}</button>
        )) : <p>No topics available.</p>}
      </div>
      {
        questions.question ? (
          <div>
            <span>Question:</span>
            <p>{questions.question}</p>
            <h2>Answer:</h2>
            <p><span>A)</span> {questions.answer_a}</p>
            <p><span>B)</span> {questions.answer_b}</p>
            <p><span>C)</span> {questions.answer_c}</p>
            <p><span>D)</span> {questions.answer_d}</p>
            <p><span>E)</span> {questions.answer_e}</p>
          </div>
        ) : ''
      }
    </div>
  );
}

export default Questions;