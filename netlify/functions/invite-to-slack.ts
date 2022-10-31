import type { Handler } from "@netlify/functions";
import { parse } from "querystring";

import { slackApi } from "./utils/slack";

export const handler: Handler = async (event) => {
  console.log(`invite to slack is triggered`);
  if (!event.body) {
    return { statusCode: 500, body: "invalid payload" };
  }

  const body = parse(event.body);
  const payload = JSON.parse(body.payload as string);

  console.log(`payload: ${JSON.stringify(payload)}`);

  await slackApi("conversations.join", {
    channel: process.env.SLACK_CHANNEL_ID,
  });

  return {
    statusCode: 200,
    body: "check to see that your bot joined the right Slack channel",
  };
};
