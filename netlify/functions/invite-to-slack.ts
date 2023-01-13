import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { getSlackAccount } from "./utils/db";

import { slackApi } from "./utils/slack";

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 500, body: "invalid payload" };
  }

  const body = parse(event.body);
  const payload = JSON.parse(body.payload as string);

  // get slack token
  const slackResp = await getSlackAccount(payload.team.id);
  if (slackResp.length !== 1) {
    return {
      // TODO(aashni): check what the error code options are
      statusCode: 404,
      body: "Error: Could not authorize account",
    };
  }

  const AUTH_TOKEN = slackResp[0].access_token;
  const WINS_CHANNEL_ID = slackResp[0].wins_channel_id;

  await slackApi("conversations.join", AUTH_TOKEN, {
    channel: WINS_CHANNEL_ID,
  });

  return {
    statusCode: 200,
    body: "check to see that your bot joined the right Slack channel",
  };
};
