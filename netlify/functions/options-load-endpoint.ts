import type { Handler } from "@netlify/functions";
import { parse } from "querystring";

export const handler: Handler = async (event) => {
  // if (!event.body) {
  //   return { statusCode: 500, body: "invalid payload" };
  // }

  // const body = parse(event.body);
  // if (!body.payload) {
  //   return { statusCode: 500, body: "invalid payload" };
  // }
  // const payload = JSON.parse(body.payload as string);
  // console.log(`\b\payload: ${Object.keys(payload.view.blocks)}`);

  // // const tempPayload = {
  // //   type: "block_suggestion",
  // //   user: {
  // //     id: "U9A18B2M9",
  // //     username: "contact",
  // //     name: "contact",
  // //     team_id: "T99HD5M6D",
  // //   },
  // //   container: { type: "view", view_id: "V0590HF8U5C" },
  // //   api_app_id: "A047M3JV3A9",
  // //   token: "R7mJx6pUgpd2onMajEFkuj5g",
  // //   action_id: "share_multiple",
  // //   block_id: "share_to_multiple_integrations",
  // //   value: "this",
  // //   team: { id: "T99HD5M6D", domain: "aashnisshah" },
  // //   enterprise: null,
  // //   is_enterprise_install: false,
  // //   view: {
  // //     id: "V0590HF8U5C",
  // //     team_id: "T99HD5M6D",
  // //     type: "modal",
  // //     blocks: [
  // //       {
  // //         type: "section",
  // //         block_id: "0gN+x",
  // //         text: {
  // //           type: "mrkdwn",
  // //           text: "Fill out this form to add a new Hype to your HypeDoc! Or, if you prefer, you can <https://hypedocs.co|create your request through the browser>.",
  // //           verbatim: false,
  // //         },
  // //       },
  // //       {
  // //         type: "input",
  // //         block_id: "title_block",
  // //         label: {
  // //           type: "plain_text",
  // //           text: "What are you celebrating?",
  // //           emoji: true,
  // //         },
  // //         hint: {
  // //           type: "plain_text",
  // //           text: "Your 1-liner for this awesome win!",
  // //           emoji: true,
  // //         },
  // //         optional: false,
  // //         dispatch_action: false,
  // //         element: {
  // //           type: "plain_text_input",
  // //           action_id: "title",
  // //           placeholder: {
  // //             type: "plain_text",
  // //             text: "I launched a new feature",
  // //             emoji: true,
  // //           },
  // //           initial_value: "",
  // //           dispatch_action_config: {
  // //             trigger_actions_on: ["on_enter_pressed"],
  // //           },
  // //         },
  // //       },
  // //       {
  // //         type: "input",
  // //         block_id: "date_block",
  // //         label: {
  // //           type: "plain_text",
  // //           text: "When did you accomplish this?",
  // //           emoji: true,
  // //         },
  // //         optional: false,
  // //         dispatch_action: false,
  // //         element: {
  // //           type: "datepicker",
  // //           action_id: "date",
  // //           placeholder: {
  // //             type: "plain_text",
  // //             text: "Select a date",
  // //             emoji: true,
  // //           },
  // //         },
  // //       },
  // //       {
  // //         type: "input",
  // //         block_id: "goal_block",
  // //         label: {
  // //           type: "plain_text",
  // //           text: "Is this related to any of your goals?",
  // //           emoji: true,
  // //         },
  // //         optional: true,
  // //         dispatch_action: false,
  // //         element: {
  // //           type: "static_select",
  // //           action_id: "goal",
  // //           placeholder: {
  // //             type: "plain_text",
  // //             text: "Select a goal",
  // //             emoji: true,
  // //           },
  // //           options: [
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "Get the Staging Environment Working",
  // //                 emoji: true,
  // //               },
  // //               value: "29eea8a4-7a8e-47e6-b7ab-2ffaf302bd52",
  // //             },
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "add descriptions to final posts",
  // //                 emoji: true,
  // //               },
  // //               value: "6ff39b4c-3e7d-4d54-8741-b0ddc008cd69",
  // //             },
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "Got the dispatch error to disappear!",
  // //                 emoji: true,
  // //               },
  // //               value: "60eed6a4-ab16-4b17-9eb7-fce4721c69d1",
  // //             },
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "Create a goal with a category",
  // //                 emoji: true,
  // //               },
  // //               value: "7295c412-602f-4fce-b032-c7f01922d6a0",
  // //             },
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "Adding emojis to the goals",
  // //                 emoji: true,
  // //               },
  // //               value: "03076b90-bfbb-4a15-b184-1cea6436c89f",
  // //             },
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "Launch multiline italized text support",
  // //                 emoji: true,
  // //               },
  // //               value: "d960f582-3db2-4fe2-a08f-2d2047ddf00c",
  // //             },
  // //           ],
  // //         },
  // //       },
  // //       {
  // //         type: "input",
  // //         block_id: "description_block",
  // //         label: {
  // //           type: "plain_text",
  // //           text: "Additional details",
  // //           emoji: true,
  // //         },
  // //         optional: true,
  // //         dispatch_action: false,
  // //         element: {
  // //           type: "plain_text_input",
  // //           action_id: "description",
  // //           placeholder: {
  // //             type: "plain_text",
  // //             text: "Add more details about your hype",
  // //             emoji: true,
  // //           },
  // //           multiline: true,
  // //           dispatch_action_config: {
  // //             trigger_actions_on: ["on_enter_pressed"],
  // //           },
  // //         },
  // //       },
  // //       {
  // //         type: "section",
  // //         block_id: "share_to_multiple_integrations",
  // //         text: {
  // //           type: "mrkdwn",
  // //           text: "Where else would you like to celebrate your hypes?",
  // //           verbatim: false,
  // //         },
  // //         accessory: {
  // //           type: "multi_external_select",
  // //           action_id: "share_multiple",
  // //           placeholder: {
  // //             type: "plain_text",
  // //             text: "Select items",
  // //             emoji: true,
  // //           },
  // //         },
  // //       },
  // //       {
  // //         type: "input",
  // //         block_id: "sharing_block",
  // //         label: {
  // //           type: "plain_text",
  // //           text: "Select how you'd like to share your Hype:",
  // //           emoji: true,
  // //         },
  // //         optional: true,
  // //         dispatch_action: false,
  // //         element: {
  // //           type: "checkboxes",
  // //           action_id: "sharing",
  // //           options: [
  // //             {
  // //               text: {
  // //                 type: "plain_text",
  // //                 text: "Share on ACME Inc's Slack in #general",
  // //                 emoji: true,
  // //               },
  // //               value: "slack",
  // //             },
  // //           ],
  // //         },
  // //       },
  // //     ],
  // //     private_metadata: "",
  // //     callback_id: "new-hype",
  // //     state: {
  // //       values: {
  // //         title_block: { title: { type: "plain_text_input", value: "" } },
  // //       },
  // //     },
  // //     hash: "1684906683.CLpaNqK5",
  // //     title: { type: "plain_text", text: "Add a new Hype", emoji: true },
  // //     clear_on_close: false,
  // //     notify_on_close: false,
  // //     close: null,
  // //     submit: { type: "plain_text", text: "Submit", emoji: true },
  // //     previous_view_id: null,
  // //     root_view_id: "V0590HF8U5C",
  // //     app_id: "A047M3JV3A9",
  // //     external_id: "",
  // //     app_installed_team_id: "T99HD5M6D",
  // //     bot_id: "B047HEWF354",
  // //   },
  // // };

  // const isMultiExternalSelect = payload.view?.blocks?.some(
  //   (block) =>
  //     block.accessory && block.accessory.type === "multi_external_select"
  // );

  let resp = {
    options: [
      {
        text: {
          type: "plain_text",
          text: "this is plain_text text 1",
        },
        value: "value-0",
      },
      {
        text: {
          type: "plain_text",
          text: "this is plain_text text 2",
        },
        value: "value-1",
      },
      {
        text: {
          type: "plain_text",
          text: "this is plain_text text3",
        },
        value: "value-2",
      },
    ],
  };

  // console.log(`resp: ${JSON.stringify(resp)}`);

  let responseBody = {
    options: [
      {
        text: { type: "plain_text", text: "this is plain_text text" },
        value: "value-0",
      },
      {
        text: { type: "plain_text", text: "this is plain_text text" },
        value: "value-1",
      },
      {
        text: { type: "plain_text", text: "this is plain_text text" },
        value: "value-2",
      },
    ],
  };

  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(responseBody),
  };

  return response;

  return {
    statusCode: 200,
    // body: JSON.stringify(resp),
    // body: `[{text:{type:"plain_text",text:"this is text",},value:"value-1"}]`,
    // body: '[{"label":{"type":"plain_text","text":"Group 1"},"options":[{"text":{"type":"plain_text","text":"*this is plain_text text*"},"value":"value-0"},{"text":{"type":"plain_text","text":"*this is plain_text text*"},"value":"value-1"},{"text":{"type":"plain_text","text":"*this is plain_text text*"},"value":"value-2"}]},{"label":{"type":"plain_text","text":"Group 2"},"options":[{"text":{"type":"plain_text","text":"*this is plain_text text*"},"value":"value-3"}]}]',
    //   body: `{"options":[{
    //     "text": {
    //         "type": "plain_text",
    //         "text": "Maru"
    //     },
    //     "value": "maru"
    // }]}`,
    // body: '{"options":[{"text":{"type":"plain_text","text":"Maru"},"value":"maru"}]}',
    body: JSON.stringify({
      options: [
        {
          text: { type: "plain_text", text: "this is plain_text text" },
          value: "value-0",
        },
        {
          text: { type: "plain_text", text: "this is plain_text text" },
          value: "value-1",
        },
        {
          text: { type: "plain_text", text: "this is plain_text text" },
          value: "value-2",
        },
      ],
    }),
  };
};
