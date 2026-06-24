import { buildQuestionRoute, matchRoute } from "./routes";

describe("question routes", () => {
  test("builds the question route with topic and subtopic", () => {
    expect(buildQuestionRoute("math", "Geometria", "Figuras planas")).toBe(
      "/subjects/math/topics/Geometria/subtopics/Figuras%20planas/questions",
    );
  });

  test("matches the question route with decoded params", () => {
    expect(
      matchRoute("/subjects/math/topics/Geometria/subtopics/Figuras%20planas/questions"),
    ).toEqual({
      name: "questions",
      params: {
        subjectId: "math",
        topic: "Geometria",
        subtopic: "Figuras planas",
      },
    });
  });

  test("matches the support materials creation route", () => {
    expect(matchRoute("/support-materials")).toEqual({
      name: "create-support-material",
      params: {},
    });
  });

  test("matches the question with support material route", () => {
    expect(matchRoute("/questions/with-support-materials")).toEqual({
      name: "create-question-with-support-materials",
      params: {},
    });
  });
});
