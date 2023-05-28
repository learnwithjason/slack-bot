import type { Handler } from "@netlify/functions";
import { SlackOption } from "./utils/interfaces";
import { getSlackListFromUserSlackId } from "./utils/db";

export const handler: Handler = async (event) => {
  let SLACK_USER_ID = "U9A18B2M9";
  console.log(`slackUserId: ${SLACK_USER_ID}`);

  let slackList: SlackOption[] = await getSlackListFromUserSlackId(
    SLACK_USER_ID
  );

  console.log(`slackList: ${JSON.stringify(slackList)}`);

  return {
    statusCode: 200,
    body: JSON.stringify(slackList),
  };
};
