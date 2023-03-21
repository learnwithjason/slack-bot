import { slackApi } from "./slack";

export const listHypesMessage = async (userId, message, authToken) => {
  await slackApi("chat.postMessage", authToken, {
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

export const listGoalsMessage = async (userId, message, authToken) => {
  await slackApi("chat.postMessage", authToken, {
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
  action,
  authToken
) => {
  return await slackApi("chat.postEphemeral", authToken, {
    channel: channelId,
    text: `Your ${actionType}, _*${action}*_,  was added to your HypeDoc! :tada:`,
    user: userId,
  });
};

export const dailyHypeBoostGeneric = async (userId, name, authToken) => {
  console.log(`inside dailyHypeBoostGeneric for userId: ${userId}`);
  return await slackApi("chat.postMessage", authToken, {
    channel: userId,
    user: userId,
    text: `Hey ${name}. You know you're awesome, and we know you're awesome! Start adding your wins to your HypeDoc today!\n\nUse \`/hype add hype\` to add a win now!`,
  }).catch((error) => console.log(error.message));
};

export const dailyBoostHype = async (userId, name, hype, authToken) => {
  console.log(
    `userId: ${userId} | name: ${name} | hype: ${hype} | authToken: ${authToken}`
  );
  console.log(`inside dailyBoostHype for userId: ${userId} | hype: ${hype}`);
  return await slackApi("chat.postMessage", authToken, {
    channel: userId,
    user: userId,
    text: `Hey ${name}! Remember that time you: :tada::tada: _*${hype}*_ :tada::tada:\n\nYou're *awesome*! Add your latest achievements using \`/hype add hype\`!`,
  }).catch((error) => console.log(error.message));
};

export const dailyGoalBoostGeneric = async (userId, name, authToken) => {
  console.log(`inside dailyGoalBoostGeneric for userId: ${userId}`);
  return await slackApi("chat.postMessage", authToken, {
    channel: userId,
    user: userId,
    text: `Hey ${name}. You know you're awesome, and we know you're awesome! Add your goals to your HypeDoc and we'll help you achieve them!\n\nUse \`/hype add goal\` to add your goals now!`,
  }).catch((error) => console.log(error.message));
};

export const dailyBoostGoal = async (userId, name, goal, authToken) => {
  return await slackApi("chat.postMessage", authToken, {
    channel: userId,
    // user: userId,
    text: `Hey ${name}! How's progress going towards your goal to: _*${goal}*_ :tada::tada:\n\nYou're *awesome*! Add your latest achievements using \`/hype add hype\`!`,
  }).catch((error) => console.log(error.message));
};

export const dailyBoostMotivation = async (userId, name, boost, authToken) => {
  return await slackApi("chat.postMessage", authToken, {
    channel: userId,
    // user: userId,
    text: `*_${boost}_*\n\n${name}, you're _awesome_! Keep track of your awesomeness now - \`/hype\`!`,
  }).catch((error) => console.log(error.message));
};
