import { slackApi } from "./slack";

export const acknowledgeAction = async (channelId, actionType, userId) => {
  return await slackApi("chat.postEphemeral", {
    channel: channelId,
    text: `Your ${actionType} was added to your HypeDoc! :tada:`,
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
