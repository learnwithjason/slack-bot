import type { Handler } from '@netlify/functions';
import { parse } from 'querystring';
import { notionApi } from './utils/notion';
import { slackApi } from './utils/slack';

export const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 500,
      body: 'error',
    };
  }

  const body = parse(event.body);
  const { trigger_id } = body;

  // load dropdown options from Notion
  const dbData = await notionApi(`/databases/${process.env.NOTION_DB_ID}`);
  const options = dbData.properties[
    'How big is the risk to Netlify if we don’t do this?'
  ].select.options.map((option) => {
    return {
      text: {
        type: 'plain_text',
        text: option.name,
      },
      value: option.name,
    };
  });

  console.log(options);

  const res = await slackApi('views.open', {
    trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Submit a DX Eng Request',
      },
      callback_id: 'submit-ticket',
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Fill out this form to submit a new DXE request! Or, if you prefer, you can <https://google.com|create your request in Notion>. Requests are reviewed twice weekly. If your request is urgent, notify <@jason>.',
          },
        },
        {
          block_id: 'title_block',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'What do you need?',
          },
          element: {
            action_id: 'title',
            type: 'plain_text_input',
            placeholder: {
              type: 'plain_text',
              text: 'Example: Run a DX audit on Netlify Graph in prep for Labs launch',
            },
            initial_value: body.text,
          },
          hint: {
            type: 'plain_text',
            text: 'Summarize your request in one sentence.',
          },
        },
        {
          block_id: 'date_block',
          type: 'input',
          element: {
            type: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'Select a date',
              emoji: true,
            },
            action_id: 'date',
          },
          label: {
            type: 'plain_text',
            text: 'When do you need this by?',
            emoji: true,
          },
        },
        {
          block_id: 'importance_block',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'How big is the risk to Netlify if we don’t do this?',
          },
          element: {
            action_id: 'importance',
            type: 'static_select',
            options,
            initial_option: options.at(0),
          },
        },
        {
          block_id: 'description_block',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Additional details',
          },
          element: {
            action_id: 'description',
            type: 'plain_text_input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Example: Links to project plans, background, context, etc.',
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
    body: '',
  };
};
