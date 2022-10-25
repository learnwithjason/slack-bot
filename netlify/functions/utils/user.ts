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
      words[1] === "hype" || words[1] === "hypes"
        ? SLACK_ACTIONS.ADD_HYPE
        : words[1] === "goal" || words[1] === "goals"
        ? SLACK_ACTIONS.ADD_GOAL
        : words[1] === "challenge" || words[1] === "challenges"
        ? SLACK_ACTIONS.ADD_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else if (words[0] === "list") {
    action =
      words[1] === "hype" || words[1] === "hypes"
        ? SLACK_ACTIONS.LIST_HYPE
        : words[1] === "goal" || words[1] === "goals"
        ? SLACK_ACTIONS.LIST_GOAL
        : words[1] === "challenge" || words[1] === "challenges"
        ? SLACK_ACTIONS.LIST_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else {
    action = SLACK_ACTIONS.ACTION_ERROR;
  }

  return action;
};

export const getActionFromCallback = (callback) => {
  let action = "";

  if (callback === "" || callback === undefined) {
    action = SLACK_ACTIONS.NO_ACTION;
  }

  const words = callback.split("-");

  if (words[0] === "new") {
    action =
      words[1] === "hype" || words[1] === "hypes"
        ? SLACK_ACTIONS.ADD_HYPE
        : words[1] === "goals" || words[1] === "goal"
        ? SLACK_ACTIONS.ADD_GOAL
        : words[1] === "challenge" || words[1] === "challenges"
        ? SLACK_ACTIONS.ADD_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else if (words[0] === "list") {
    action =
      words[1] === "hype" || words[1] === "hypes"
        ? SLACK_ACTIONS.LIST_HYPE
        : words[1] === "goals" || words[1] === "goal"
        ? SLACK_ACTIONS.LIST_GOAL
        : words[1] === "challenge" || words[1] === "challenges"
        ? SLACK_ACTIONS.LIST_CHALLENGE
        : SLACK_ACTIONS.ACTION_ERROR;
  } else {
    action = SLACK_ACTIONS.ACTION_ERROR;
  }

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

export const formatHypesForSlackMessage = async (hypes) => {
  let listHypeMessage = "*:tada::tada: Let's celebrate _you_ :tada::tada:*\n\n";
  if (!hypes || hypes.length == 0) {
    // no hypes, return prompt message:
    listHypeMessage = `You haven't added any hypes yet. But we know you're awesome, so add some now by typing \`/hypeDocs add hype\` or through the <https://hypedocs.co/home|hypedocs.co website> :tada::tada:`;
    return listHypeMessage;
  }

  let messageList = hypes.map(
    (hype, key) => `${key + 1}. *${hype.title}* - ${hype.description}`
  );
  listHypeMessage = listHypeMessage + "\n\n" + messageList.join("\n");

  listHypeMessage = `${listHypeMessage}\n\n\n\n:tada::tada: Aren't you awesome! :tada::tada:\n\nAdd more hypes by typing \`/hypeDocs add hype\` or add new goals by using \`/hypeDocs add goal\`.\nYou can also log on at <https://hypedocs.co/home|hypedocs.co>.`;

  return listHypeMessage;
};
