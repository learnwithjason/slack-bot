import { v4 as uuidv4 } from "uuid";
import { convertYYYYMMDDToTimestamp, getTodaysDateAsTimestamp } from "./dates";
import { createHype, createGoal } from "./db";
import { goalStates } from "./enums";

export const createNewHype = async (firebaseUser, slackData) => {
  // Checking data input:
  // TODO(aashni): figure out if we want to make fields optional or required
  //      and if required, how do we throw an error on slack

  const isPublicPageSelected = slackData.sharing.find((shared) => {
    return shared.value === "publicPage";
  });

  // Getting data:
  let hypeData = {
    id: uuidv4(),
    user_id: firebaseUser.uid,
    title: slackData.title,
    date: getTodaysDateAsTimestamp(),
    dateHypeHappened: convertYYYYMMDDToTimestamp(slackData.date),
    description: slackData.description,
    category: slackData.category || "",
    goal: slackData.goal || "",
    public: isPublicPageSelected !== undefined,
    currentStatus: "ACTIVE",
  };

  const createHypeResponse = await createHype(hypeData);

  // TODO(aashni): check if the hype was actually added and add some error handling incase it wasn't
  // TODO(aashni): add some analysis information here
};

export const createNewGoal = async (firebaseUser, slackData) => {
  // Checking data input:

  // Getting data:
  let goalData = {
    id: uuidv4(),
    user_id: firebaseUser.uid,
    title: slackData.title,
    date: getTodaysDateAsTimestamp(),
    description: slackData.description,
    currentGoalStatus: "ACTIVE_GOAL",
    goalState: goalStates.PROGRESS,
  };

  const createGoalResponse = await createGoal(goalData);

  // TODO(aashni): check if the hype was actually added and add some error handling incase it wasn't
  // TODO(aashni): add some analysis information here
};
