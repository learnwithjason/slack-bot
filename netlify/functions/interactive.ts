import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { acknowledgeAction } from "./utils/commonMessages";
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

  const action = getActionFromCallback(payload.view.callback_id);
  let res = {};

  if (action === SLACK_ACTIONS.ADD_HYPE) {
    res = addHypeAction(payload);
  } else if (action === SLACK_ACTIONS.ADD_GOAL) {
    res = addGoalAction(payload);
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

const addHypeAction = async (payload) => {
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

  let firebaseUser = await getFirebaseUserFromSlackUser(payload.user.id);
  let newHypeCreated = await createNewHype(firebaseUser[0], slackData);

  const isSlackSelected = slackData.sharing.find((shared) => {
    return shared.value === "slack";
  });

  if (isSlackSelected) {
    await slackApi("chat.postMessage", {
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
    slackData.title
  );
};

const addGoalAction = async (payload) => {
  const values = payload.view.state.values;

  // simplify the data from Slack a bit
  const slackData = {
    title: values.title_block.title.value,
    description: values.description_block.description.value,
    sharing: values.sharing_block.sharing.selected_options,
  };
  let firebaseUser = await getFirebaseUserFromSlackUser(payload.user.id);
  let newGoalCreated = await createNewGoal(firebaseUser[0], slackData);
  const isSlackSelected = slackData.sharing.find((shared) => {
    return shared.value === "slack";
  });
  if (isSlackSelected) {
    await slackApi("chat.postMessage", {
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

  acknowledgeAction(payload.user.id, payload.user.id, "goal", slackData.title);
};
