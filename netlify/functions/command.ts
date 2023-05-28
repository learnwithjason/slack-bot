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
  getSlackUsersByUId,
  getUserSlackFromUserSlackId,
  getSlackListFromUserSlackId,
  getSlackListFromUserId,
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
import { getSlackOptionsFromFirebase } from "./options-load-endpoint";
import { SlackOption } from "./utils/interfaces";

export const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 500,
      body: "Error: missing parameters",
    };
  }

  const body = parse(event.body);
  const { text, user_id, team_id } = body;
  if (!user_id || !team_id) {
    return { statusCode: 500, body: "Error: missing parameters" };
  }

  // get slack token
  const slackResp = await getSlackAccount(team_id);
  if (slackResp.length !== 1) {
    // TODO(aashni): change this to a generic error message instead
    await userNotFoundCommand(body, "email", "authToken");
    return {
      statusCode: 200,
      body: "Slack Authentication failed",
    };
  }

  const AUTH_TOKEN = slackResp[0].access_token;
  const WINS_CHANNEL_ID = slackResp[0].wins_channel_id;
  const WINS_CHANNEL_NAME = slackResp[0].wins_channel_name;
  const SLACK_DATA = slackResp[0];

  // check if user exists
  const email = await getUserEmailFromSlack(user_id, AUTH_TOKEN);
  const hypeUser = await getUserByEmail(email);

  if (hypeUser.length < 1) {
    await userNotFoundCommand(body, email, AUTH_TOKEN);

    return {
      statusCode: 200,
      body: "User Not Found",
    };
  }

  let action = getActionFromText(text);

  let res;

  if (action === SLACK_ACTIONS.BASE_ACTION) {
    res = await baseHypeCommand(
      body,
      hypeUser,
      AUTH_TOKEN,
      SLACK_DATA.team_name,
      WINS_CHANNEL_NAME
    );
  } else if (action === SLACK_ACTIONS.ADD_HYPE) {
    res = await addHypeCommand(
      body,
      hypeUser,
      AUTH_TOKEN,
      SLACK_DATA.team_name,
      WINS_CHANNEL_NAME
    );
  } else if (action === SLACK_ACTIONS.ADD_GOAL) {
    res = await addGoalCommand(
      body,
      AUTH_TOKEN,
      SLACK_DATA.team_name,
      WINS_CHANNEL_NAME
    );
  } else if (action === SLACK_ACTIONS.LIST_HYPE) {
    res = await listHypeCommand(body, hypeUser[0], AUTH_TOKEN);
  } else if (action === SLACK_ACTIONS.LIST_GOAL) {
    res = await listGoalCommand(body, hypeUser[0], AUTH_TOKEN);
  } else {
    res = await commandNotFoundCommand(body, hypeUser[0], AUTH_TOKEN, text);
  }

  return returnRes(res);
};

// HELPER FUNCTIONS
const userNotFoundCommand = async (body, email, authToken) => {
  const { trigger_id } = body;

  let createAnAccountText = `Create an account - use *SLACKHYPE* for 20% off`;

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
          type: "section",
          text: {
            type: "mrkdwn",
            text: `We couldn't find a HypeDocs account associated with your email _${email}_.`,
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
            text: "If this sounds like a mistake, get in touch with us at contact@hypedocs.co!",
          },
        },
      ],
    },
  });

  return res;
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

  return res;
};

const baseHypeCommand = async (
  body,
  hypeUser,
  authToken,
  slackName,
  winChannelName
) => {
  const { trigger_id } = body;

  const res = await slackApi("views.open", authToken, {
    trigger_id,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "How to Use HypeDocs",
      },
      callback_id: "base-hype",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":tada: Let's Get Hyped :tada:",
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: " :loud_sound: *How to get started* :loud_sound:",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "HypeDocs is here to help you create goals, track your small and big wins (we call these Hypes!) and celebrate with your team.",
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":boom: |   *HYPES*  | :boom: ",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "`/hype add hype` *Add Hypes* _ use this command to add a hype to your HypeDoc_",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "`/hype list hypes` *List Hypes* _ use this command to see the most recent hypes in your HypeDoc_",
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: ":large_green_circle: |   *GOALS*  | :large_green_circle: ",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "`/hype add goal` *Add Goals* _ use this command to add goals to your HypeDoc_",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "`/hype list goals` *List Goals* _ use this command to list the most recent goals in your HypeDoc_",
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*More coming soon!*",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "We're hard at work building out more awesome features for you. Have a request or feedback? Let us know at contact@hypedocs.co!",
            verbatim: false,
          },
        },
      ],
    },
  });

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

  const goalOptions = await getUserGoalOptionsFromFirebase(hypeUser[0].uid);

  const slackUserAccounts = await getSlackUsersByUId(hypeUser[0].uid);
  // console.log(`userid:${hypeUser[0].uid}`);
  // console.log(`slackUserAccount: ${JSON.stringify(slackUserAccounts)}`);
  // const slackOptionsFromFirebase = await getUserSlackFromUserSlackId(
  //   "U9A18B2M9"
  // );
  // console.log(`testing: ${JSON.stringify(slackOptionsFromFirebase)}`);

  console.log(
    `userSlackId: ${hypeUser[0].uid}, hypeUser[0] general: ${JSON.stringify(
      hypeUser[0]
    )}`
  );
  let slackList: SlackOption[] = await getSlackListFromUserId(hypeUser[0].uid);

  console.log(`>>> slackList: ${JSON.stringify(slackList)}`);

  let slackOptions: object[] = [];

  if (slackList === undefined || slackList.length === 0) {
    slackOptions.push({
      text: {
        type: "plain_text",
        text: "No other sources - add one in Settings",
      },
      value: "NO_ALT_INTEGRATIONS",
    });
  } else {
    !!slackList &&
      slackList.forEach((option) => {
        slackOptions.push({
          text: {
            type: "plain_text",
            text: `#${option.wins_channel_name} in ${option.team_name}`,
          },
          value: `${option.id}`,
        });
      });
  }

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

        // {
        //   block_id: "sharing_multi_block",
        //   type: "input",
        //   optional: true,
        //   label: {
        //     type: "plain_text",
        //     text: "Is this related to any of your goals?",
        //   },
        //   element: {
        //     action_id: "goal",
        //     type: "multi_static_select",
        //     options: shareOptions,
        //     placeholder: {
        //       type: "plain_text",
        //       text: "Select a goal",
        //       emoji: true,
        //     },
        //   },
        // },

        // {
        //   type: "section",
        //   block_id: "section678",
        //   label: {
        //     type: "mrkdwn",
        //     text: "Where else would you like to share this Hype?",
        //   },
        //   accessory: {
        //     action_id: "share_hype_multi",
        //     type: "multi_static_select",
        //     placeholder: {
        //       type: "plain_text",
        //       text: "Select items",
        //     },
        //     // options: shareOptions,
        //     options: [
        //       {
        //         text: {
        //           type: "plain_text",
        //           text: "*this is plain_text text*",
        //         },
        //         value: "value-0",
        //       },
        //       {
        //         text: {
        //           type: "plain_text",
        //           text: "*this is plain_text text*",
        //         },
        //         value: "value-1",
        //       },
        //       {
        //         text: {
        //           type: "plain_text",
        //           text: "*this is plain_text text*",
        //         },
        //         value: "value-2",
        //       },
        //     ],
        //   },
        // },

        {
          type: "section",
          block_id: "share_multiple_block",
          text: {
            type: "mrkdwn",
            text: "Where else would you like to celebrate your hypes?",
          },
          accessory: {
            action_id: "share_multiple",
            type: "multi_static_select",
            // initial_options:
            //   '[{"text":{"type":"plain_text","text":"Maru"},"value":"maru"}]',
            placeholder: {
              type: "plain_text",
              text: "Select items",
            },
            options: slackOptions,
            // slackData: JSON.stringify(slackOptionsFromFirebase),
          },
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

  return res;
};

const addGoalCommand = async (body, authToken, slackName, winChannelName) => {
  const { trigger_id } = body;

  const categoryOptions = getCategoriesForSlack();

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
            text: "Submit this form to add a new Goal to your HypeDoc! Or, if you prefer, you can <https://hypedocs.co|goals add your goal through the browser>.",
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

  return res;
};

const listHypeCommand = async (body, hypeUser, authToken) => {
  const { user_id } = body;

  const userHypes = await getUserHypes(hypeUser.uid, 7);
  const slackMessage = await formatHypesForSlackMessage(userHypes);

  const res = await listHypesMessage(user_id, slackMessage, authToken);

  return res;
};

const listGoalCommand = async (body, hypeUser, authToken) => {
  const { trigger_id, user_id, text } = body;

  const userHypes = await getUserGoals(hypeUser.uid, 7);

  const slackMessage = await formatGoalsForSlackMessage(userHypes);

  const res = await listHypesMessage(user_id, slackMessage, authToken);

  return res;
};

const returnRes = (res) => {
  if (res && res["ok"]) {
    return {
      statusCode: 200,
      body: "",
    };
  } else {
    return {
      statusCode: 500,
      body: "There was an error running this command. Try again or contact HypeDocs Support.",
    };
  }
};
