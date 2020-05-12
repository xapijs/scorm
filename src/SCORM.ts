import XAPI, {
  Statement,
  ContextActivity,
  Activity,
  Context,
  Verb,
  ResultScore,
  Result,
  ObjectiveActivityDefinition,
  ObjectiveActivity,
  InteractionActivity,
  InteractionActivityDefinition
} from "@xapi/xapi";
import { SCORMConfig } from "./interfaces/SCORMConfig";
// import { uuidv4 } from "./helpers/uuidv4";

/**
 * Experience API SCORM Profile
 * Reference: https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html
 */
export default class SCORM {
  private config: SCORMConfig;
  private connection: XAPI;

  constructor(outOfBandConfiguration?: SCORMConfig) {
    // Get Web-Based Activities launch parameters
    const queryParamConfig: SCORMConfig = XAPI.getSearchQueryParamsAsObject(window.location.href) as SCORMConfig;
    // Use found query param config OR
    // default to Out-of-Band configuration
    if (Object.keys(queryParamConfig).length > 0) {
      this.config = queryParamConfig;
    } else if (outOfBandConfiguration) {
      this.config = outOfBandConfiguration;
    }
    // Fail if we do not have a configuration
    if (this.config === undefined) {
      throw Error("Unable to construct, no xAPI configuration found in the URL and fallback configuration not provided.");
    }
    // TODO: Attempt IRIs
    // Get attempts array
      // If array exists
        // if IRI does not exist in array already
          // add IRI on to existing array
          // Put array to activity state document
      // If array does not exist
        // create new array with IRI in
        // Post array to activity state document

    // if (!config.attemptIRI) {
    //   config.attemptIRI = uuidv4();
    // }
    this.connection = new XAPI(
      this.config.endpoint || "",
      this.config.auth || ""
    );
    // Auto-initialise/resume
    if (this.config.entry === "ab-initio") {
      this.abInitio();
    } else if (this.config.entry === "resume") {
      this.resume();
    }
  }

  public getConfig(): SCORMConfig {
    return this.config;
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#comments-from-learner
  public comments(comments: string): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.COMMENTED,
      result: {
        response: comments
      }
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#scorm-activity-profile-comment-object
  public complete(): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.COMPLETED
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#entry
  public abInitio(): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.INITIALIZED
    });
  }

  public resume(): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.RESUMED
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#exit
  public exit(duration?: string, successStatus?: boolean, completionStatus?: boolean, score?: ResultScore): Promise<string[]> {
    const result: Result = {
      ...(duration ? {duration: duration} : {}),
      ...(typeof successStatus === "boolean" ? {success: successStatus} : {}),
      ...(typeof completionStatus === "boolean" ? {completion: completionStatus} : {}),
      ...(score ? {score: score} : {})
    };
    return this.request({
      verb: XAPI.Verbs.TERMINATED,
      ...(Object.keys(result).length ? {result: result} : {})
    });
  }

  public suspend(duration?: string): Promise<string[]> {
    const result: Result = {
      ...(duration ? {duration: duration} : {})
    };
    return this.request({
      verb: XAPI.Verbs.SUSPENDED,
      ...(Object.keys(result).length ? {result: result} : {})
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#interactions
  public interaction(interactionId: number, response: string, definition: InteractionActivityDefinition, id?: string): Promise<string[]> {
    const interactionActivity: InteractionActivity = {
      objectType: "Activity",
      id: id || `${this.config.courseIRI}/${this.config.lessonIRI}/interaction/${interactionId}`,
      definition: definition
    };
    return this.request({
      verb: XAPI.Verbs.RESPONDED,
      result: {
        response: response
      },
      object: interactionActivity
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#objectives
  public objective(objectiveId: string, verb: Verb, definition: ObjectiveActivityDefinition, id?: string): Promise<string[]> {
    const objectiveActivity: ObjectiveActivity = {
      objectType: "Activity",
      id: id || `${this.config.courseIRI}/${this.config.lessonIRI}/objective/${objectiveId}`,
      definition: definition
    };
    return this.request({
      verb: verb,
      object: objectiveActivity
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#score
  public score(score: ResultScore): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.SCORED,
      result: {
        score: score
      }
    });
  }

  // https://adl.gitbooks.io/scorm-profile-xapi/content/xapi-scorm-profile.html#success-status
  public pass(): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.PASSED
    });
  }

  public fail(): Promise<string[]> {
    return this.request({
      verb: XAPI.Verbs.FAILED
    });
  }

  private get statementObject(): Activity | undefined {
    if (!this.config.lessonIRI) {
      return undefined;
    }
    const lessonTitle = this.config.lessonTitle
    ? {
        name: {
          "en-US": this.config.lessonTitle
        }
      }
    : {};
    const lessonDescription = this.config.lessonDescription
    ? {
        description: {
          "en-US": this.config.lessonDescription
        }
      }
    : {};
    const activity: Activity = {
      objectType: "Activity",
      id: this.config.lessonIRI,
      definition: {
        ...lessonTitle,
        ...lessonDescription,
        type: "http://adlnet.gov/expapi/activities/lesson"
      },
    };
    return activity;
  }

  private get statementContext(): Context {
    const scormProfileCategory: ContextActivity = {
      id: "https://w3id.org/xapi/scorm",
      definition: {
        type: "http://adlnet.gov/expapi/activities/profile"
      }
    };
    const attemptActivity: ContextActivity | undefined = this.attemptActivity;
    const courseActivity: ContextActivity | undefined = this.courseActivity;
    const context: Context = {
      contextActivities: {
        category: [scormProfileCategory],
        grouping: [
          ...(attemptActivity ? [attemptActivity] : []),
          ...(courseActivity ? [courseActivity] : [])
        ]
      }
    };
    return context;
  }

  private get attemptActivity(): ContextActivity | undefined {
    if (!this.config.courseIRI || !this.config.attemptIRI) {
      return undefined;
    }
    const attemptTitle = this.config.courseTitle ? {
      "name": {
        "en-US": `Attempt of ${this.config.courseTitle}`
      }
    } : {};
    const attemptDescription = this.config.lessonTitle && this.config.courseTitle ? {
      "description": {
        "en-US": `The activity representing an attempt of ${this.config.lessonTitle} in the course ${this.config.courseTitle}`
      }
    } : {};
    const attempt: ContextActivity = {
      id: `${this.config.courseIRI}?attemptId=${this.config.attemptIRI}`,
      definition: {
        ...attemptTitle,
        ...attemptDescription,
        type: "http://adlnet.gov/expapi/activities/attempt"
      }
    };
    return attempt;
  }

  private get courseActivity(): ContextActivity | undefined {
    if (!this.config.courseIRI) {
      return undefined;
    }
    const courseTitle = this.config.courseTitle
    ? {
        name: {
          "en-US": this.config.courseTitle
        }
      }
    : {};
    const courseDescription = this.config.courseDescription
    ? {
        description: {
          "en-US": this.config.courseDescription
        }
      }
    : {};
    const grouping: ContextActivity = {
      id: this.config.courseIRI as string,
      definition: {
        ...courseTitle,
        ...courseDescription,
        type: "http://adlnet.gov/expapi/activities/course"
      }
    };
    return grouping;
  }

  private request(statement: Partial<Statement>): Promise<string[]> {
    const combinedStatement: Partial<Statement> = {
      actor: this.config.actor,
      object: this.statementObject,
      context: this.statementContext,
      timestamp: new Date().toISOString(),
      ...statement
    };
    return this.connection.sendStatement(combinedStatement as Statement);
  }
}
