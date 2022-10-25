import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { getUserByEmail, getUser, createHype, getUserHypes } from "./utils/db";
import { getCategoriesForSlack, SLACK_ACTIONS } from "./utils/enums";
import { slackApi } from "./utils/slack";
import {
  formatHypesForSlackMessage,
  getActionFromText,
  getUserEmailFromSlack,
  getUserGoalOptionsFromFirebase,
} from "./utils/user";

export const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 500,
      body: "error",
    };
  }

  const body = parse(event.body);
  const { text } = body;

  let action = getActionFromText(text);

  let res = {};

  if (action === SLACK_ACTIONS.ADD_HYPE) {
    res = addHypeCommand(body);
  } else if (action === SLACK_ACTIONS.ADD_GOAL) {
    res = addGoalCommand(body);
  } else if (action === SLACK_ACTIONS.LIST_HYPE) {
    res = listHypeCommand(body);
  } else {
    return {
      // TODO(aashni): check what the error code options are
      statusCode: 404,
      body: "Command usage incorrect. Try again",
    };
  }

  // TODO(aashni): Check if res has any errors, otherwise return 200
  return {
    statusCode: 200,
    body: "",
  };
};

// HELPER FUNCTIONS
const addHypeCommand = async (body) => {
  const { trigger_id, user_id, text } = body;

  const email = await getUserEmailFromSlack(user_id);
  const hypeUser = await getUserByEmail(email);
  // TODO(aashni): add a check - if no user found, throw an error

  const categoryOptions = getCategoriesForSlack();
  const goalOptions = await getUserGoalOptionsFromFirebase(hypeUser[0].uid);

  const res = await slackApi("views.open", {
    trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Add a new Hype",
      },
      callback_id: "new-hype",
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Fill out this form to add a new Hype to your HypeDoc! Or, if you prefer, you can <https://hypedocs.co|create your request through the browser>.",
          },
        },
        {
          block_id: "title_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "What are you celebrating?",
          },
          element: {
            action_id: "title",
            type: "plain_text_input",
            placeholder: {
              type: "plain_text",
              text: "I launched a new feature",
            },
            // TODO(aashni): set an initial value using the title
            initial_value: "",
          },
          hint: {
            type: "plain_text",
            text: "Your 1-liner for this awesome win!",
          },
        },
        {
          block_id: "date_block",
          type: "input",
          element: {
            type: "datepicker",
            placeholder: {
              type: "plain_text",
              text: "Select a date",
              emoji: true,
            },
            action_id: "date",
          },
          label: {
            type: "plain_text",
            text: "When did you accomplish this?",
            emoji: true,
          },
        },
        {
          block_id: "category_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "How do you categorize this Hype?",
          },
          element: {
            action_id: "category",
            type: "static_select",
            options: categoryOptions,
            initial_option: categoryOptions[0],
          },
        },
        {
          block_id: "goal_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "Is this related to any of your goals?",
          },
          element: {
            action_id: "goal",
            type: "static_select",
            options: goalOptions,
            initial_option: goalOptions[0],
          },
        },
        {
          block_id: "description_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "Additional details",
          },
          element: {
            action_id: "description",
            type: "plain_text_input",
            multiline: true,
            placeholder: {
              type: "plain_text",
              text: "Add more details about your hype",
            },
          },
          optional: true,
        },
        {
          block_id: "sharing_block",
          type: "input",
          optional: true,
          element: {
            type: "checkboxes",
            action_id: "sharing",
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Share on Slack in #channel",
                  emoji: true,
                },
                value: "slack",
              },
              {
                text: {
                  type: "plain_text",
                  text: "Add to your Public Page",
                  emoji: true,
                },
                value: "publicPage",
              },
            ],
          },
          label: {
            type: "plain_text",
            text: "Select how you'd like to share your Hype:",
            emoji: true,
          },
        },
      ],
    },
  });

  console.log(res);

  return res;
};

const addGoalCommand = async (body) => {
  const { trigger_id, user_id, text } = body;

  // TODO(aashni): do the user validation check before coming into the individual commands
  const email = await getUserEmailFromSlack(user_id);
  const hypeUser = await getUserByEmail(email);
  // TODO(aashni): add a check - if no user found, throw an error

  const res = await slackApi("views.open", {
    trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Add a new Goal",
      },
      callback_id: "new-goal",
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Fill out this form to add a new Goal to your HypeDoc! Or, if you prefer, you can <https://hypedocs.co|goals add your goal through the browser>.",
          },
        },
        {
          block_id: "title_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "What are you working towards?",
          },
          element: {
            action_id: "title",
            type: "plain_text_input",
            placeholder: {
              type: "plain_text",
              text: "Build a rocket",
            },
            // TODO(aashni): set an initial value using the title
            initial_value: "",
          },
          hint: {
            type: "plain_text",
            text: "Your 1-liner for your goal",
          },
        },
        {
          block_id: "description_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "Additional details",
          },
          element: {
            action_id: "description",
            type: "plain_text_input",
            multiline: true,
            placeholder: {
              type: "plain_text",
              text: "Add more details about your goal",
            },
          },
          optional: true,
        },
        {
          block_id: "sharing_block",
          type: "input",
          optional: true,
          element: {
            type: "checkboxes",
            action_id: "sharing",
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Share on Slack in #channel",
                  emoji: true,
                },
                value: "slack",
              },
            ],
          },
          label: {
            type: "plain_text",
            text: "Select how you'd like to share your Hype:",
            emoji: true,
          },
        },
      ],
    },
  });

  console.log(res);
  return res;
};

const listHypeCommand = async (body) => {
  const { trigger_id, user_id, text } = body;

  // TODO(aashni): do the user validation check before coming into the individual commands
  const email = await getUserEmailFromSlack(user_id);
  const hypeUser = await getUserByEmail(email);
  // TODO(aashni): add a check - if no user found, throw an error

  const userHypes = await getUserHypes(hypeUser[0].uid);

  const slackMessage = await formatHypesForSlackMessage(userHypes);

  await slackApi("chat.postMessage", {
    channel: process.env.SLACK_CHANNEL_ID,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: slackMessage,
        },
      },
    ],
  });

  return {
    statusCode: 200,
    body: "",
  };
};
