import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
import { createNewHype } from "./utils/hypes";
import { slackApi } from "./utils/slack";
import { getFirebaseUserFromSlackUser } from "./utils/user";

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 500, body: "invalid payload" };
  }

  const body = parse(event.body);
  const payload = JSON.parse(body.payload as string);

  // const samplePayload = {
  //   type: "view_submission",
  //   team: { id: "T99HD5M6D", domain: "aashnisshah" },
  //   user: {
  //     id: "U9A18B2M9",
  //     username: "contact",
  //     name: "contact",
  //     team_id: "T99HD5M6D",
  //   },
  //   api_app_id: "A047M3JV3A9",
  //   token: "R7mJx6pUgpd2onMajEFkuj5g",
  //   trigger_id: "4261096358310.315591191217.9776d838d36aa1a7a63da51e12f4d37c",
  //   view: {
  //     id: "V047Y4T89HS",
  //     team_id: "T99HD5M6D",
  //     type: "modal",
  //     blocks: [
  //       {
  //         type: "section",
  //         block_id: "hzA",
  //         text: {
  //           type: "mrkdwn",
  //           text: "Fill out this form to add a new Hype to your HypeDoc! Or, if you prefer, you can <https://hypedocs.co|create your request through the browser>.",
  //           verbatim: false,
  //         },
  //       },
  //       {
  //         type: "input",
  //         block_id: "title_block",
  //         label: {
  //           type: "plain_text",
  //           text: "What are you celebrating?",
  //           emoji: true,
  //         },
  //         hint: {
  //           type: "plain_text",
  //           text: "Your 1-liner for this awesome win!",
  //           emoji: true,
  //         },
  //         optional: false,
  //         dispatch_action: false,
  //         element: {
  //           type: "plain_text_input",
  //           action_id: "title",
  //           placeholder: {
  //             type: "plain_text",
  //             text: "I launched a new feature",
  //             emoji: true,
  //           },
  //           initial_value: "",
  //           dispatch_action_config: {
  //             trigger_actions_on: ["on_enter_pressed"],
  //           },
  //         },
  //       },
  //       {
  //         type: "input",
  //         block_id: "date_block",
  //         label: {
  //           type: "plain_text",
  //           text: "When did you accomplish this?",
  //           emoji: true,
  //         },
  //         optional: false,
  //         dispatch_action: false,
  //         element: {
  //           type: "datepicker",
  //           action_id: "date",
  //           placeholder: {
  //             type: "plain_text",
  //             text: "Select a date",
  //             emoji: true,
  //           },
  //         },
  //       },
  //       {
  //         type: "input",
  //         block_id: "category_block",
  //         label: {
  //           type: "plain_text",
  //           text: "How do you categorize this Hype?",
  //           emoji: true,
  //         },
  //         optional: false,
  //         dispatch_action: false,
  //         element: {
  //           type: "static_select",
  //           action_id: "category",
  //           initial_option: {
  //             text: { type: "plain_text", text: "Personal", emoji: true },
  //             value: "Personal",
  //           },
  //           options: [
  //             {
  //               text: { type: "plain_text", text: "Personal", emoji: true },
  //               value: "Personal",
  //             },
  //             {
  //               text: { type: "plain_text", text: "Work", emoji: true },
  //               value: "Work",
  //             },
  //             {
  //               text: {
  //                 type: "plain_text",
  //                 text: "Health and Fitness",
  //                 emoji: true,
  //               },
  //               value: "Health and Fitness",
  //             },
  //             {
  //               text: { type: "plain_text", text: "Family", emoji: true },
  //               value: "Family",
  //             },
  //             {
  //               text: {
  //                 type: "plain_text",
  //                 text: "Awards or Achievements",
  //                 emoji: true,
  //               },
  //               value: "Awards or Achievements",
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         type: "input",
  //         block_id: "goal_block",
  //         label: {
  //           type: "plain_text",
  //           text: "Is this related to any of your goals?",
  //           emoji: true,
  //         },
  //         optional: false,
  //         dispatch_action: false,
  //         element: {
  //           type: "static_select",
  //           action_id: "goal",
  //           initial_option: {
  //             text: { type: "plain_text", text: "this is a goal", emoji: true },
  //             value: "c5710d7c-70c0-4747-b443-d9e2dc02647d",
  //           },
  //           options: [
  //             {
  //               text: {
  //                 type: "plain_text",
  //                 text: "this is a goal",
  //                 emoji: true,
  //               },
  //               value: "c5710d7c-70c0-4747-b443-d9e2dc02647d",
  //             },
  //             {
  //               text: {
  //                 type: "plain_text",
  //                 text: "goal 2 reporting for duty",
  //                 emoji: true,
  //               },
  //               value: "a58bd901-dc75-4c9a-a093-f6f8bad623e7",
  //             },
  //           ],
  //         },
  //       },
  //       {
  //         type: "input",
  //         block_id: "description_block",
  //         label: {
  //           type: "plain_text",
  //           text: "Additional details",
  //           emoji: true,
  //         },
  //         optional: true,
  //         dispatch_action: false,
  //         element: {
  //           type: "plain_text_input",
  //           action_id: "description",
  //           placeholder: {
  //             type: "plain_text",
  //             text: "Add more details about your hype",
  //             emoji: true,
  //           },
  //           multiline: true,
  //           dispatch_action_config: {
  //             trigger_actions_on: ["on_enter_pressed"],
  //           },
  //         },
  //       },
  //       {
  //         type: "input",
  //         block_id: "sharing_block",
  //         label: {
  //           type: "plain_text",
  //           text: "Select how you'd like to share your Hype:",
  //           emoji: true,
  //         },
  //         optional: false,
  //         dispatch_action: false,
  //         element: {
  //           type: "checkboxes",
  //           action_id: "sharing",
  //           options: [
  //             {
  //               text: {
  //                 type: "plain_text",
  //                 text: "Share on Slack in #channel",
  //                 emoji: true,
  //               },
  //               value: "slack",
  //             },
  //             {
  //               text: {
  //                 type: "plain_text",
  //                 text: "Add to your Public Page",
  //                 emoji: true,
  //               },
  //               value: "publicPage",
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //     private_metadata: "",
  //     callback_id: "new-hype",
  //     state: {
  //       values: {
  //         title_block: {
  //           title: { type: "plain_text_input", value: "sharing action" },
  //         },
  //         date_block: {
  //           date: { type: "datepicker", selected_date: "2022-10-24" },
  //         },
  //         category_block: {
  //           category: {
  //             type: "static_select",
  //             selected_option: {
  //               text: { type: "plain_text", text: "Personal", emoji: true },
  //               value: "Personal",
  //             },
  //           },
  //         },
  //         goal_block: {
  //           goal: {
  //             type: "static_select",
  //             selected_option: {
  //               text: {
  //                 type: "plain_text",
  //                 text: "this is a goal",
  //                 emoji: true,
  //               },
  //               value: "c5710d7c-70c0-4747-b443-d9e2dc02647d",
  //             },
  //           },
  //         },
  //         description_block: {
  //           description: { type: "plain_text_input", value: "asdw" },
  //         },
  //         sharing_block: {
  //           sharing: {
  //             type: "checkboxes",
  //             selected_options: [
  //               {
  //                 text: {
  //                   type: "plain_text",
  //                   text: "Add to your Public Page",
  //                   emoji: true,
  //                 },
  //                 value: "publicPage",
  //               },
  //             ],
  //           },
  //         },
  //       },
  //     },
  //     hash: "1666637575.4draARcm",
  //     title: { type: "plain_text", text: "Add a new Hype", emoji: true },
  //     clear_on_close: false,
  //     notify_on_close: false,
  //     close: null,
  //     submit: { type: "plain_text", text: "Submit", emoji: true },
  //     previous_view_id: null,
  //     root_view_id: "V047Y4T89HS",
  //     app_id: "A047M3JV3A9",
  //     external_id: "",
  //     app_installed_team_id: "T99HD5M6D",
  //     bot_id: "B047HEWF354",
  //   },
  //   response_urls: [],
  //   is_enterprise_install: false,
  //   enterprise: null,
  // };

  // console.log(`payload: ${JSON.stringify(payload)}`);
  // console.log(`callback_id = ${payload.view.callback_id}`);

  if (payload.view.callback_id === "new-hype") {
    console.log(`adding a new hype and handling the request`);

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

    console.log(`slackData:`);
    console.log(slackData, null, 2);

    let firebaseUser = await getFirebaseUserFromSlackUser(payload.user.id);
    console.log(`firebaseUser: ${JSON.stringify(firebaseUser)}`);
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
              text: `A new hype was created by <@${payload.user.id}>.\n\n*:tada: _${slackData.title}!_ :tada:*\n\n`,
            },
          },
        ],
      });
    }

    return {
      statusCode: 200,
      body: "",
    };
  } else {
    // return an error message as we don't support the command
  }

  // TODO(aashni):
  //  check data and format it as a new hype
  //  push hype to firebase
  //  if required, share hype to appropriate channels

  await slackApi("chat.postMessage", {
    channel: process.env.SLACK_CHANNEL_ID,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A new hype was created by <@${payload.user.id}>.`,
        },
      },
    ],
  });

  return {
    statusCode: 200,
    body: "",
  };
};
