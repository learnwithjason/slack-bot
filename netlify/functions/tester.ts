import type { Handler } from "@netlify/functions";
import { SlackOption } from "./utils/interfaces";
import { getSlackListFromUserId } from "./utils/db";

export const handler: Handler = async (event) => {
  let SLACK_USER_ID = "U9A18B2M9";

  let slackList: SlackOption[] = await getSlackListFromUserId(SLACK_USER_ID);

  return {
    statusCode: 200,
    body: JSON.stringify(slackList),
  };
};
