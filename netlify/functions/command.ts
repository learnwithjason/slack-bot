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

  const categoryOptions = [
    {
      text: {
        type: "plain_text",
        text: "category 1",
        emoji: true,
      },
      value: "category-1",
    },
    {
      text: {
        type: "plain_text",
        text: "category 2",
        emoji: true,
      },
      value: "category-2",
    },
  ];

  const goalOptions = [
    {
      text: {
        type: "plain_text",
        text: "goal 1",
        emoji: true,
      },
      value: "goal-1",
    },
    {
      text: {
        type: "plain_text",
        text: "goal 2",
        emoji: true,
      },
      value: "goal-2",
    },
  ];

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
          element: {
            type: "checkboxes",
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

  return {
    statusCode: 200,
    body: "",
  };
};
