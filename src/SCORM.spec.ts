import XAPI, {
  Agent,
  ResultScore,
  ObjectiveActivityDefinition,
  InteractionActivityDefinition,
} from "@xapi/xapi";
import SCORM from "./SCORM";
import { SCORMConfig } from "./interfaces/SCORMConfig";

const endpoint: string = process.env.LRS_ENDPOINT || "";
const username: string = process.env.LRS_USERNAME || "";
const password: string = process.env.LRS_PASSWORD || "";
const auth: string = `Basic ${btoa(username + ":" + password)}`;

const testAgent: Agent = {
  objectType: "Agent",
  name: "Jest",
  mbox: "mailto:hello@example.com",
};

const config: SCORMConfig = {
  entry: "ab-initio",
  endpoint: endpoint,
  auth: auth,
  actor: testAgent,
  courseIRI: "https://github.com/xapijs",
  lessonIRI: "https://github.com/xapijs/scorm",
};

const scorm: SCORM = new SCORM(config);

describe("scorm temporal model", () => {
  test("can initialise", () => {
    return scorm.abInitio().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can comment", () => {
    return scorm.comments("Hello World").then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can complete", () => {
    return scorm.complete().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can resume", () => {
    return scorm.resume().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can exit", () => {
    return scorm.exit().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can exit with duration", () => {
    return scorm.exit("PT1H30M15S").then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can exit with success", () => {
    return scorm.exit(undefined, true).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can exit with completion", () => {
    return scorm.exit(undefined, undefined, true).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can exit with score", () => {
    return scorm
      .exit(undefined, undefined, undefined, {
        scaled: 1,
      })
      .then((result) => {
        return expect(result.data).toHaveLength(1);
      });
  });

  test("can exit with duration, success, completion and score", () => {
    return scorm
      .exit("PT1H30M15S", true, true, {
        scaled: 1,
      })
      .then((result) => {
        return expect(result.data).toHaveLength(1);
      });
  });

  test("can suspend", () => {
    return scorm.suspend().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can suspend with duration", () => {
    return scorm.suspend("PT1H30M15S").then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report true/false interaction", () => {
    const answer: string = "true";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "What is true?",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "true-false",
      correctResponsesPattern: ["true"],
    };
    return scorm.interaction(1, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report choice interaction", () => {
    const answer: string = "choice1[,]choice2";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "What are the first two choices?",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "choice",
      correctResponsesPattern: ["choice1[,]choice2"],
      choices: [
        {
          id: "choice1",
          description: {
            "en-US": "Choice 1",
          },
        },
        {
          id: "choice2",
          description: {
            "en-US": "Choice 2",
          },
        },
        {
          id: "choice3",
          description: {
            "en-US": "Choice 3",
          },
        },
        {
          id: "choice4",
          description: {
            "en-US": "Choice 4",
          },
        },
      ],
    };
    return scorm.interaction(2, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report fill-in interaction", () => {
    const answer: string = "World";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "Hello?",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "fill-in",
      correctResponsesPattern: ["World"],
    };
    return scorm.interaction(3, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report long-fill-in interaction", () => {
    const answer: string = "World";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "Hello?",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "long-fill-in",
      correctResponsesPattern: ["{case_matters=false}{lang=en}World"],
    };
    return scorm.interaction(4, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report likert interaction", () => {
    const answer: string = "likert_4";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "What is the highest value on this likert?",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "likert",
      correctResponsesPattern: ["likert_4"],
      scale: [
        {
          id: "likert_0",
          description: {
            "en-US": "Very Unsatisfied",
          },
        },
        {
          id: "likert_1",
          description: {
            "en-US": "Unsatisfied",
          },
        },
        {
          id: "likert_2",
          description: {
            "en-US": "Neutral",
          },
        },
        {
          id: "likert_3",
          description: {
            "en-US": "Satisfied",
          },
        },
        {
          id: "likert_4",
          description: {
            "en-US": "Very Satisfied",
          },
        },
      ],
    };
    return scorm.interaction(5, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report matching interaction", () => {
    const answer: string = "apple[.]fruit[,]carrot[.]vegetable";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "Match the food items to their groups.",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "matching",
      correctResponsesPattern: ["apple[.]fruit[,]carrot[.]vegetable"],
      source: [
        {
          id: "apple",
          description: {
            "en-US": "Apple",
          },
        },
        {
          id: "carrot",
          description: {
            "en-US": "Carrot",
          },
        },
      ],
      target: [
        {
          id: "fruit",
          description: {
            "en-US": "Fruit",
          },
        },
        {
          id: "vegetable",
          description: {
            "en-US": "Vegetable",
          },
        },
      ],
    };
    return scorm.interaction(6, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report performance interaction", () => {
    const answer: string = "score[.]1[,]score2[.]5";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "A set of scores",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "performance",
      correctResponsesPattern: ["score[.]1:[,]score2[.]5:6"],
      steps: [
        {
          id: "score",
          description: {
            "en-US": "Scores for part 1",
          },
        },
        {
          id: "score2",
          description: {
            "en-US": "Scores for part 2",
          },
        },
      ],
    };
    return scorm.interaction(7, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report sequencing interaction", () => {
    const answer: string = "one[,]two[,]three[,]four";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "Put the numbers in order:",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "sequencing",
      correctResponsesPattern: ["one[,]two[,]three[,]four"],
      choices: [
        {
          id: "four",
          description: {
            "en-US": "Four",
          },
        },
        {
          id: "two",
          description: {
            "en-US": "Two",
          },
        },
        {
          id: "one",
          description: {
            "en-US": "One",
          },
        },
        {
          id: "three",
          description: {
            "en-US": "Three",
          },
        },
      ],
    };
    return scorm.interaction(8, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report numeric interaction", () => {
    const answer: string = "2";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "How many legs does a human have?",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "numeric",
      correctResponsesPattern: ["2"],
    };
    return scorm.interaction(9, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report other interaction", () => {
    const answer: string = "(35.937432,-86.868896)";
    const definition: InteractionActivityDefinition = {
      description: {
        "en-US": "On this map, please mark Franklin, TN",
      },
      type: "http://adlnet.gov/expapi/activities/cmi.interaction",
      interactionType: "other",
      correctResponsesPattern: ["(35.937432,-86.868896)"],
    };
    return scorm.interaction(10, answer, definition).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can report objective", () => {
    const definition: ObjectiveActivityDefinition = {
      name: {
        "en-US": "Test Objective",
      },
      description: {
        "en-US": "An objective used for testing purposes",
      },
      type: "http://adlnet.gov/expapi/activities/objective",
    };
    return scorm
      .objective("test", XAPI.Verbs.COMPLETED, definition)
      .then((result) => {
        return expect(result.data).toHaveLength(1);
      });
  });

  test("can score", () => {
    const score: ResultScore = {
      scaled: 1,
    };
    return scorm.score(score).then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can pass", () => {
    return scorm.pass().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });

  test("can fail", () => {
    return scorm.fail().then((result) => {
      return expect(result.data).toHaveLength(1);
    });
  });
});

describe("attempt state", () => {
  test("can update the current attempt state", () => {
    /* eslint-disable */
    return scorm
      .setCurrentAttemptState({
        adl_data: [],
        comments_from_lms: {
          comment: "",
          location: "",
          timestamp: "",
        },
        credit: "no-credit",
        location: "",
        mode: "browse",
        preferences: {
          audio_captioning: 0,
          audio_level: 1,
          delivery_speed: 1,
          language: "",
        },
        total_time: "",
      })
      .then((result) => {
        return expect(result.data).toBeDefined();
      });
    /* eslint-enable */
  });

  test("can get the current attempt state", () => {
    return scorm.getCurrentAttemptState().then((result) => {
      expect(result.data).toBeDefined();
    });
  });
});
