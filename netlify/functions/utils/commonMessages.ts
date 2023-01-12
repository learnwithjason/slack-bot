import { slackApi } from "./slack";

export const listHypesMessage = async (userId, message) => {
  await slackApi("chat.postMessage", {
    channel: userId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
    ],
  });
};

export const listGoalsMessage = async (userId, message) => {
  await slackApi("chat.postMessage", {
    channel: userId,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
    ],
  });
};

export const acknowledgeAction = async (
  channelId,
  userId,
  actionType,
  action
) => {
  return await slackApi("chat.postEphemeral", {
    channel: channelId,
    text: `Your ${actionType}, _*${action}*_,  was added to your HypeDoc! :tada:`,
    user: userId,
  });
};

export const dailyBoostGeneric = async (userId, name) => {
  return await slackApi("chat.postMessage", {
    channel: userId,
    // user: userId,
    text: `Hey ${name}. You know you're awesome, and we know you're awesome! Start adding your wins to your HypeDoc today!\n\nUse \`/hypedocs add hype\` to add a win now!`,
  }).catch((error) => console.log(error.message));
};

export const dailyBoostHype = async (userId, name, hype) => {
  return await slackApi("chat.postMessage", {
    channel: userId,
    // user: userId,
    text: `Hey ${name}! Remember that time you: :tada::tada: _*${hype}*_ :tada::tada:\n\nYou're *awesome*! Add your latest achievements using \`/hypedocs add hype\`!`,
  }).catch((error) => console.log(error.message));
};

export const dailyBoostGoal = async (userId, name, goal) => {
  return await slackApi("chat.postMessage", {
    channel: userId,
    // user: userId,
    text: `Hey ${name}! How's progress going towards your goal to: _*${goal}*_ :tada::tada:\n\nYou're *awesome*! Add your latest achievements using \`/hypedocs add hype\`!`,
  }).catch((error) => console.log(error.message));
};

export const dailyBoostMotivation = async (userId, name, boost) => {
  return await slackApi("chat.postMessage", {
    channel: userId,
    // user: userId,
    text: `:tada::tada:Hey ${name}! _*${boost}*_ :tada::tada:\n\nYou're *awesome*! Add your latest achievements using \`/hypedocs add hype\`!`,
  }).catch((error) => console.log(error.message));
};
