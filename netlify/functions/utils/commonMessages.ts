import { slackApi } from "./slack";

export const acknowledgeAction = async (channelId, actionType, userId) => {
  return await slackApi("chat.postEphemeral", {
    channel: channelId,
    text: `Your ${actionType} was added to your HypeDoc! :tada:`,
    user: userId,
  });
};
