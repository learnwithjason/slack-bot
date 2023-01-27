import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { SLACK_ACTIONS } from "./utils/enums";
import { createNewHype, createNewGoal } from "./utils/hypes";
import { slackApi } from "./utils/slack";
import {
  getActionFromCallback,
  getActionFromSubscription,
  getFirebaseUserFromSlackUser,
} from "./utils/user";

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 500, body: "invalid payload" };
  }

  const body = JSON.parse(event.body);

  if (body.type === "url_verification") {
    // this is for URL verification
    return {
      statusCode: 200,
      body: body.challenge,
    };
  }

  const bodyEvent = body.event;

  const action = await getActionFromSubscription(bodyEvent.type);

  if (action === SLACK_ACTIONS.URL_VERIFICATION) {
  } else if (action === SLACK_ACTIONS.APP_HOME_OPENED) {
  } else if (action === SLACK_ACTIONS.ACTION_ERROR) {
    return {
      statusCode: 200,
      body: "Error - Unknown action requested",
    };
  }

  return {
    statusCode: 200,
    body: "",
  };
};
