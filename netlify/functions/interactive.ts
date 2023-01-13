import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { acknowledgeAction } from "./utils/commonMessages";
import { getToken } from "./utils/db";
import { SLACK_ACTIONS } from "./utils/enums";
import { createNewHype, createNewGoal } from "./utils/hypes";
import { slackApi } from "./utils/slack";
import {
  getActionFromCallback,
  getFirebaseUserFromSlackUser,
} from "./utils/user";

export const handler: Handler = async (event) => {
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

  const AUTH_TOKEN = tokenResp[0].access_token;

  const action = getActionFromCallback(payload.view.callback_id);
  let res = {};

  if (action === SLACK_ACTIONS.ADD_HYPE) {
    res = addHypeAction(payload, AUTH_TOKEN);
  } else if (action === SLACK_ACTIONS.ADD_GOAL) {
    res = addGoalAction(payload, AUTH_TOKEN);
  } else {
    return {
      // TODO(aashni): check what the error code options are
      statusCode: 404,
      body: "Command usage incorrect. Try again",
    };
  }

  return {
    statusCode: 200,
    body: "",
  };
};

// HELPER ACTION FUNCTIONS

const addHypeAction = async (payload, authToken) => {
  const values = payload.view.state.values;

  // simplify the data from Slack a bit
  const slackData = {
    title: values.title_block.title.value,
    date: values.date_block.date.selected_date,
    category: values.category_block.category.selected_option.value,
    goal: values.goal_block.goal.selected_option.value,
    description: values.description_block.description.value,
    sharing: values.sharing_block.sharing.selected_options,
  };

  let firebaseUser = await getFirebaseUserFromSlackUser(
    payload.user.id,
    authToken
  );
  let newHypeCreated = await createNewHype(firebaseUser[0], slackData);

  const isSlackSelected = slackData.sharing.find((shared) => {
    return shared.value === "slack";
  });

  if (isSlackSelected) {
    await slackApi("chat.postMessage", authToken, {
      // TODO(aashni): need to store individual SLACK_CHANNEL_ID's into firebase --> will need to configure them when we create a business account
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*:tada: _${slackData.title}!_ :tada:* - <@${payload.user.id}>'s latest hype!`,
          },
        },
      ],
    });
  }

  acknowledgeAction(
    payload.user.id,
    payload.user.id,
    "achievement",
    slackData.title,
    authToken
  );
};

const addGoalAction = async (payload, authToken) => {
  const values = payload.view.state.values;

  // simplify the data from Slack a bit
  const slackData = {
    title: values.title_block.title.value,
    description: values.description_block.description.value,
    sharing: values.sharing_block.sharing.selected_options,
  };
  let firebaseUser = await getFirebaseUserFromSlackUser(
    payload.user.id,
    authToken
  );
  let newGoalCreated = await createNewGoal(firebaseUser[0], slackData);
  const isSlackSelected = slackData.sharing.find((shared) => {
    return shared.value === "slack";
  });
  if (isSlackSelected) {
    await slackApi("chat.postMessage", authToken, {
      // TODO(aashni): need to store individual SLACK_CHANNEL_ID's into firebase --> will need to configure them when we create a business account
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*:tada: _${slackData.title}!_ :tada:* - <@${payload.user.id}>'s newest goal!`,
          },
        },
      ],
    });
  }

  acknowledgeAction(
    payload.user.id,
    payload.user.id,
    "goal",
    slackData.title,
    authToken
  );
};
