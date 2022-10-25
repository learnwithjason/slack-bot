import { getUserGoals, getUserByEmail } from "./db";
import { SLACK_ACTIONS } from "./enums";
import { slackApi } from "./slack";

export const getActionFromText = (text) => {
  let action = "";

  if (text === "" || text === undefined) {
    action = SLACK_ACTIONS.NO_ACTION;
  }

  const words = text.split(" ");
  if (words[0] === "add") {
    action =
      words[1] === "hype"
        ? SLACK_ACTIONS.ADD_HYPE
        : words[1] === "goals" || words[1] === "goal"
        ? SLACK_ACTIONS.ADD_GOAL
        : words[1] === "challenge"
        ? SLACK_ACTIONS.ADD_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else if (words[0] === "list") {
    action =
      words[1] === "hype"
        ? SLACK_ACTIONS.LIST_HYPE
        : words[1] === "goals" || words[1] === "goal"
        ? SLACK_ACTIONS.LIST_GOAL
        : words[1] === "challenge"
        ? SLACK_ACTIONS.LIST_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else {
    action = SLACK_ACTIONS.ACTION_ERROR;
  }

  console.log(`action before return: ${action}`);

  return action;
};

export const getActionFromCallback = (callback) => {
  let action = "";

  if (callback === "" || callback === undefined) {
    action = SLACK_ACTIONS.NO_ACTION;
  }

  const words = callback.split("-");
  console.log(`words: ${JSON.stringify(words)}`);

  if (words[0] === "new") {
    action =
      words[1] === "hype"
        ? SLACK_ACTIONS.ADD_HYPE
        : words[1] === "goals" || words[1] === "goal"
        ? SLACK_ACTIONS.ADD_GOAL
        : words[1] === "challenge"
        ? SLACK_ACTIONS.ADD_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else if (words[0] === "list") {
    action =
      words[1] === "hype"
        ? SLACK_ACTIONS.LIST_HYPE
        : words[1] === "goals" || words[1] === "goal"
        ? SLACK_ACTIONS.LIST_GOAL
        : words[1] === "challenge"
        ? SLACK_ACTIONS.LIST_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else {
    action = SLACK_ACTIONS.ACTION_ERROR;
  }

  console.log(`action before return: ${action}`);

  return action;
};

export const getUserEmailFromSlack = async (user_id) => {
  const slackUser = await slackApi(`users.info?user=${user_id}`);
  const email = slackUser.user?.profile?.email || false;

  return email;
};

export const getFirebaseUserFromSlackUser = async (user_id) => {
  const slackEmail = await getUserEmailFromSlack(user_id);
  const firebaseUser = !!slackEmail ? await getUserByEmail(slackEmail) : {};
  return firebaseUser;
};

export const getUserGoalOptionsFromFirebase = async (user_id) => {
  const goalsFromFirebase = await getUserGoals(user_id);

  const goalOptions = goalsFromFirebase.map((goal) => {
    return {
      text: {
        type: "plain_text",
        text: goal.title,
        emoji: true,
      },
      value: goal.id,
    };
  });

  return goalOptions;
};
