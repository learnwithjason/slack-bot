import {
  getUserGoals,
  getUserByEmail,
  getSlackUsersByUId,
  getSlackListBySlackIds,
  getUserSlackFromUserSlackId,
  getSlackFromSlackId,
} from "./db";
import { goalStates, SLACK_ACTIONS } from "./enums";
import { slackApi } from "./slack";
import { getItalizedString } from "./utils";

export const getActionFromText = (text) => {
  let action = "";

  if (text === "" || text === undefined) {
    action = SLACK_ACTIONS.BASE_ACTION;
    return action;
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

export const getActionFromSubscription = async (subscription) => {
  let action = "";

  if (subscription === "" || subscription === undefined) {
    action = SLACK_ACTIONS.NO_ACTION;
    return action;
  }

  const words = subscription.split(" ");

  if (words[0] === "url_verification") {
    action = SLACK_ACTIONS.URL_VERIFICATION;
  } else if (words[0] === "app_home_opened") {
    action = SLACK_ACTIONS.APP_HOME_OPENED;
  } else {
    action = SLACK_ACTIONS.ACTION_ERROR;
  }

  return action;
};

export const getUserEmailFromSlack = async (user_id, AUTH_TOKEN) => {
  const slackUser = await slackApi(`users.info?user=${user_id}`, AUTH_TOKEN);
  const email = slackUser.user?.profile?.email || false;

  return email;
};

export const getFirebaseUserFromSlackUser = async (user_id, AUTH_TOKEN) => {
  const slackEmail = await getUserEmailFromSlack(user_id, AUTH_TOKEN);
  const firebaseUser = !!slackEmail ? await getUserByEmail(slackEmail) : {};
  return firebaseUser;
};

export const getUserGoalOptionsFromFirebase = async (user_id) => {
  const goalsFromFirebase = await getUserGoals(user_id, 0);
  const goalOptions: object[] = [];

  if (goalsFromFirebase.length === 0) {
    // set initial "No Goal" option
    goalOptions.push({
      text: { type: "plain_text", text: "No Goal", emoji: true },
      value: "NO_GOAL_SELECTED",
    });
  } else {
    goalsFromFirebase.forEach((goal) => {
      goalOptions.push({
        text: {
          type: "plain_text",
          text: goal.title,
          emoji: true,
        },
        value: goal.id,
      });
    });
  }

  return goalOptions;
};

export const getSlackOptionsFromFirebase = async (userSlackId) => {
  console.log(`userSlackId: ${userSlackId}`);
  let slackOptions: object[] = [];

  // const userId = await getUserSlackFromUserSlackId(userSlackId);
  // console.log(`userId: ${userId}`);
  // const slackOptionsFromFirebase = await getSlackUsersByUId(userId);

  let tempUserId = "i92Vh0rW1vRjQPprmpf0niIQAkJ3";
  const slackOptionsFromFirebase = await getSlackUsersByUId(tempUserId);

  console.log(
    `slackOptionsFromFirebase: ${JSON.stringify(slackOptionsFromFirebase)}`
  );

  if (slackOptionsFromFirebase.length === 0) {
    slackOptions.push({
      text: {
        type: "plain_text",
        text: "No other sources - add one in Settings",
      },
      value: "NO_ALT_INTEGRATIONS",
    });
  } else {
    let slackList = await getSlackListBySlackIds(slackOptionsFromFirebase);
    console.log(`\n\nslackList: ${JSON.stringify(slackList)}`);

    slackList.forEach((option) => {
      slackOptions.push({
        text: {
          type: "plain_text",
          text: `#${option.wins_channel_name} in ${option.team_name}`,
        },
        value: `${option.id}`,
      });
    });
  }

  console.log(`\n\slackPptions: ${JSON.stringify(slackOptions)}`);

  return slackOptions;
};

export const shareHypeToOtherSlackChannels = async (
  slackId,
  slackData,
  winsChannelId,
  userSlackId
) => {
  console.log(
    `> inside shareHypeToOtherSlackChannels, slackId: ${slackId}, winsChannelId: ${winsChannelId}`
  );

  // get auth token from slackId
  let slackFromDb = await getSlackFromSlackId(slackId);

  if (slackFromDb.length > 0) {
    let italizedDescription = getItalizedString(slackData.description);

    await slackApi("chat.postMessage", slackFromDb[0].access_token, {
      channel: slackFromDb[0].wins_channel_id,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:tada: *New hype:* ${slackData.title}\n${italizedDescription}\n-<@${userSlackId}>`,
          },
        },
      ],
    });
    console.log(`completed the share`);
  }
};

export const formatHypesForSlackMessage = async (hypes) => {
  let listHypeMessage = "*:tada::tada: Let's celebrate _you_ :tada::tada:*\n\n";
  if (!hypes || hypes.length == 0) {
    // no hypes, return prompt message:
    listHypeMessage = `You haven't added any hypes yet. But we know you're awesome, so add some now by typing \`/hype add hype\` or through the <https://hypedocs.co/home|hypedocs.co website> :tada::tada:`;
    return listHypeMessage;
  }

  let messageList = hypes.map(
    (hype, key) =>
      `*${hype.title}* - <https://hypedocs.co/hype/${hype.id}|see more>`
  );
  listHypeMessage = listHypeMessage + "\n\n" + messageList.join("\n");

  listHypeMessage = `${listHypeMessage}\n\n\n\n:tada::tada: Aren't you awesome! :tada::tada:\n\nAdd more hypes by typing \`/hype add hype\` or add new goals by using \`/hype add goal\`.\nYou can also log on at <https://hypedocs.co/home|hypedocs.co>.`;

  return listHypeMessage;
};

export const formatGoalsForSlackMessage = async (goals) => {
  let listGoalMessage =
    "*:tada::tada: What Are You Working Towards? :tada::tada:*\n\n";
  if (!goals || goals.length == 0) {
    // no hypes, return prompt message:
    listGoalMessage = `You haven't added any goals yet. Add some now by typing \`/hype add goal\` or through the <https://hypedocs.co/home|hypedocs.co website> :tada::tada:`;
    return listGoalMessage;
  }

  let messageList = goals.map(
    (goal) =>
      `${
        goal.status === goalStates.COMPLETE
          ? `:large_green_circle:`
          : `:large_purple_circle:`
      }. *${goal.title}* - <https://hypedocs.co/goal/${goal.id}|see progress>`
  );
  listGoalMessage = listGoalMessage + "\n\n" + messageList.join("\n");

  listGoalMessage = `${listGoalMessage}\n\n\n\n:tada::tada: Keep adding all your small and big wins as you work towards your goals! :tada::tada:\n\nAdd more hypes by typing \`/hype add hype\` or add new goals by using \`/hype add goal\`.\nYou can also log on at <https://hypedocs.co/home|hypedocs.co>.`;

  return listGoalMessage;
};
