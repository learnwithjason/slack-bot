import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
// import { notionApi } from "./utils/notion";
import { slackApi } from "./utils/slack";

export const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 500,
      body: "error",
    };
  }

  const body = parse(event.body);
  const { trigger_id } = body;

  // load dropdown options from Notion
  // const dbData = await notionApi(`/databases/${process.env.NOTION_DB_ID}`);
  // const options = dbData.properties[
  //   "How big is the risk to Netlify if we don’t do this?"
  // ].select.options.map((option) => {
  //   return {
  //     text: {
  //       type: "plain_text",
  //       text: option.name,
  //     },
  //     value: option.name,
  //   };
  // });

  // console.log(options);
  // const optionsTest = [
  //   {
  //     text: {
  //       type: "plain_text",
  //       text: "option 1",
  //     },
  //     value: "value 1",
  //   },
  //   {
  //     text: {
  //       type: "plain_text",
  //       text: "option 2",
  //     },
  //     value: "value 2",
  //   },
  //   {
  //     text: {
  //       type: "plain_text",
  //       text: "option 3",
  //     },
  //     value: "value 3",
  //   },
  //   {
  //     text: {
  //       type: "plain_text",
  //       text: "option 4",
  //     },
  //     value: "value 4",
  //   },
  // ];

  // const options = optionsTest.map((option) => {
  //   return { option };
  // });

  const options = [
    {
      text: {
        type: "plain_text",
        text: "option 0",
        emoji: true,
      },
      value: "value-0",
    },
    {
      text: {
        type: "plain_text",
        text: "option 1",
        emoji: true,
      },
      value: "value-1",
    },
  ];

  console.log(`options: ${JSON.stringify(options)}`);

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
            initial_value: body.text,
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
          block_id: "importance_block",
          type: "input",
          label: {
            type: "plain_text",
            text: "How big is the risk to Netlify if we don’t do this?",
          },
          element: {
            action_id: "importance",
            type: "static_select",
            options,
            initial_option: options[0],
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
              text: "Example: Links to project plans, background, context, etc.",
            },
          },
          optional: true,
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
