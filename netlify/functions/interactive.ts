import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { acknowledgeAction } from "./utils/commonMessages";
import { getSlackAccount } from "./utils/db";
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
  if (!body.payload) {
    return { statusCode: 500, body: "invalid payload" };
  }
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

  const action = getActionFromCallback(payload.view.callback_id);
  let res;

  if (action === SLACK_ACTIONS.ADD_HYPE) {
    res = await addHypeAction(payload, AUTH_TOKEN, WINS_CHANNEL_ID);
  } else if (action === SLACK_ACTIONS.ADD_GOAL) {
    res = await addGoalAction(payload, AUTH_TOKEN, WINS_CHANNEL_ID);
  } else {
    res = await actionNotFoundAction();
  }

  return {
    // TODO(aashni): check what the error code options are
    statusCode: 200,
    body: "",
  };
};

// HELPER ACTION FUNCTIONS

const addHypeAction = async (payload, authToken, winsChannelId) => {
  const values = payload.view.state.values;

  // hack to support when a user has no goals
  let goal = getGoalValueFromBlock(values.goal_block.goal);

  // simplify the data from Slack a bit
  const slackData = {
    title: values.title_block.title.value,
    date: values.date_block.date.selected_date,
    goal: goal,
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
      channel: winsChannelId,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*:tada: _${slackData.title}!_ :tada:* - <@${payload.user.id}>'s latest hype!\n_${slackData.description}_`,
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

const addGoalAction = async (payload, authToken, winsChannelId) => {
  const values = payload.view.state.values;

  // simplify the data from Slack a bit
  const slackData = {
    title: values.title_block.title.value,
    description: values.description_block.description.value,
    category: values.category_block.category.selected_option.value,
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
      channel: winsChannelId,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*:tada: _${slackData.title}!_ :tada:* - <@${payload.user.id}>'s newest goal!\n_${slackData.description}_`,
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

const actionNotFoundAction = async () => {
  return {
    // TODO(aashni): check what the error code options are
    statusCode: 404,
    body: "Command usage incorrect. Try again",
  };
};

const getGoalValueFromBlock = (goalFromBlock) => {
  // check if goal exists
  if (goalFromBlock && goalFromBlock.selected_option) {
    return goalFromBlock.selected_option.value === "NO_GOAL_SELECTED"
      ? ""
      : goalFromBlock.selected_option.value;
  }

  return "";
};
