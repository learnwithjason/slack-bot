import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { getToken } from "./utils/db";

import { slackApi } from "./utils/slack";

export const handler: Handler = async (event) => {
  console.log(`invite to slack is triggered`);
  if (!event.body) {
    return { statusCode: 500, body: "invalid payload" };
  }

  const body = parse(event.body);
  const payload = JSON.parse(body.payload as string);

  // get slack token
  const tokenResp = await getToken(payload.team.id);
  if (tokenResp.length !== 1) {
    return {
      // TODO(aashni): check what the error code options are
      statusCode: 404,
      body: "Error: Could not authorize account",
    };
  }
  console.log(`tokenResp: ${JSON.stringify(tokenResp)}`);
  const AUTH_TOKEN = tokenResp[0].access_token;

  console.log(`payload: ${JSON.stringify(payload)}`);

  await slackApi("conversations.join", AUTH_TOKEN, {
    channel: process.env.SLACK_CHANNEL_ID,
  });

  return {
    statusCode: 200,
    body: "check to see that your bot joined the right Slack channel",
  };
};
