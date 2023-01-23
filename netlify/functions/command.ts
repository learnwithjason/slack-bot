import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { listGoalsMessage, listHypesMessage } from "./utils/commonMessages";
import {
  getUserByEmail,
  getUser,
  createHype,
  getUserHypes,
  getUserGoals,
  getSlackAccount,
} from "./utils/db";
import { getCategoriesForSlack, SLACK_ACTIONS } from "./utils/enums";
import { slackApi } from "./utils/slack";
import {
  formatGoalsForSlackMessage,
  formatHypesForSlackMessage,
  getActionFromText,
  getUserEmailFromSlack,
  getUserGoalOptionsFromFirebase,
} from "./utils/user";

export const handler: Handler = async (event) => {
  console.log(`inside command`);
  if (!event.body) {
    return {
      statusCode: 500,
      body: "Error: missing parameters",
    };
  }

  const body = parse(event.body);
  const { text, user_id, team_id } = body;
  if (!text || !user_id || !team_id) {
    return { statusCode: 500, body: "Error: missing parameters" };
  }
  console.log(`text: ${text} | user_id: ${user_id} | team_id: ${team_id}`);

  // get slack token
  const slackResp = await getSlackAccount(team_id);
  console.log(`slackResp: ${JSON.stringify(slackResp)}`);
  if (slackResp.length !== 1) {
    console.log("slackResp.length !== 1");
    // TODO(aashni): change this to a generic error message instead
    await userNotFoundCommand(body, "email", "authToken");
    return {
      statusCode: 200,
      body: "Slack Authentication failed",
    };
  }
  console.log("user found");

  const AUTH_TOKEN = slackResp[0].access_token;
  const WINS_CHANNEL_ID = slackResp[0].wins_channel_id;
  const WINS_CHANNEL_NAME = slackResp[0].wins_channel_name;
  const SLACK_DATA = slackResp[0];

  // check if user exists
  const email = await getUserEmailFromSlack(user_id, AUTH_TOKEN);
  const hypeUser = await getUserByEmail(email);
  console.log(`email: ${email}`);
  console.log(`hypeUser: ${JSON.stringify(hypeUser)}`);

  if (hypeUser.length < 1) {
    console.log("hypeuser.length < 1");
    await userNotFoundCommand(body, email, AUTH_TOKEN);

    return {
      statusCode: 200,
      body: "User Not Found",
    };
  }

  let action = getActionFromText(text);
  console.log(`action: ${action}`);

  let res;

  if (action === SLACK_ACTIONS.ADD_HYPE) {
    console.log("go to addHypeCommand");
    res = await addHypeCommand(
      body,
      hypeUser,
      AUTH_TOKEN,
      SLACK_DATA.team_name,
      WINS_CHANNEL_NAME
    );
  } else if (action === SLACK_ACTIONS.ADD_GOAL) {
    console.log("go to addGoalCommand");
    res = await addGoalCommand(
      body,
      AUTH_TOKEN,
      SLACK_DATA.team_name,
      WINS_CHANNEL_NAME
    );
  } else if (action === SLACK_ACTIONS.LIST_HYPE) {
    console.log("go to listHypeCommand");
    res = await listHypeCommand(body, hypeUser[0], AUTH_TOKEN);
  } else if (action === SLACK_ACTIONS.LIST_GOAL) {
    console.log("go to listGoalCommand");
    res = await listGoalCommand(body, hypeUser[0], AUTH_TOKEN);
  } else {
    console.log("go to commandNotFoundCommand");
    res = await commandNotFoundCommand(body, hypeUser[0], AUTH_TOKEN, text);
  }

  // TODO(aashni): Check if res has any errors, otherwise return 200
  return res;
};

// HELPER FUNCTIONS
const userNotFoundCommand = async (body, email, authToken) => {
  const { trigger_id } = body;

  let createAnAccountText = `You can create an account easily through the web.`;

  // TODO(aashni): check if slack is part of our business accounts / have a partnership code / something here
  if (false) {
    createAnAccountText = `${createAnAccountText} In partnership with <CommunityName> you can use \`<DiscountCode>\` for a <DiscountAmount> discount.`;
  }

  const res = await slackApi("views.open", authToken, {
    trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Account Not Found",
      },
      callback_id: "user-not-found",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "Your HypeDocs Account Can't Be Found",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `We couldn't find a HypeDocs account associated with your email ${email}.`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: createAnAccountText,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Create an Account",
              emoji: true,
            },
            value: "create_an_account",
            url: "https://hypedocs.co/auth/signup",
            action_id: "button-action",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "If this sounds like a mistake, get in touch with us and we'll help you!",
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Email Us",
              emoji: true,
            },
            value: "contact_us",
            url: "mailto:contact@hypedocs.co",
            action_id: "button-action",
          },
        },
      ],
    },
  });

  console.log(res);

  return {
    statusCode: 200,
    body: "",
  };
};

const commandNotFoundCommand = async (body, email, authToken, command) => {
  const { trigger_id } = body;

  let commandNotFoundText = `Unfortunately the command you entered, \`${command}\`, is not yet supported.\n\n\nTry one of the following options instead:\n\n\n\`/hype add [hype/goal]\` to add a new hype or goal.\n\n\`/hypedocs list [hypes/goals]\` to list your hypes or goals.`;

  const res = await slackApi("views.open", authToken, {
    trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Command Not Found",
      },
      callback_id: "command-not-found",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "The command you entered is not yet supported.",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: commandNotFoundText,
          },
        },
      ],
    },
  });

  console.log(res);

  return res;
};

const addHypeCommand = async (
  body,
  hypeUser,
  authToken,
  slackName,
  winChannelName
) => {
  const { trigger_id } = body;

  const categoryOptions = getCategoriesForSlack();
  const goalOptions = await getUserGoalOptionsFromFirebase(hypeUser[0].uid);

  const res = await slackApi("views.open", authToken, {
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
            placeholder: {
              type: "plain_text",
              text: "Select a category",
              emoji: true,
            },
          },
        },
        {
          block_id: "goal_block",
          type: "input",
          optional: true,
          label: {
            type: "plain_text",
            text: "Is this related to any of your goals?",
          },
          element: {
            action_id: "goal",
            type: "static_select",
            options: goalOptions,
            placeholder: {
              type: "plain_text",
              text: "Select a goal",
              emoji: true,
            },
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
                  text: `Share on ${slackName}'s Slack in #${winChannelName}`,
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

const addGoalCommand = async (body, authToken, slackName, winChannelName) => {
  const { trigger_id } = body;

  const res = await slackApi("views.open", authToken, {
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
                  text: `Share on ${slackName}'s Slack in #${winChannelName}`,
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

const listHypeCommand = async (body, hypeUser, authToken) => {
  const { user_id } = body;

  const userHypes = await getUserHypes(hypeUser.uid, 7);
  const slackMessage = await formatHypesForSlackMessage(userHypes);

  await listGoalsMessage(user_id, slackMessage, authToken);

  return {
    statusCode: 200,
    body: "",
  };
};

const listGoalCommand = async (body, hypeUser, authToken) => {
  const { trigger_id, user_id, text } = body;

  const userHypes = await getUserGoals(hypeUser.uid, 7);

  const slackMessage = await formatGoalsForSlackMessage(userHypes);

  await listHypesMessage(user_id, slackMessage, authToken);

  return {
    statusCode: 200,
    body: "",
  };
};
