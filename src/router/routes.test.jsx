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
});
