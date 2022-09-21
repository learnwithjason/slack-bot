import type { Handler } from '@netlify/functions';
import { parse } from 'querystring';

export const handler: Handler = async (event) => {
  if (!event.body) {
    return {
      statusCode: 500,
      body: 'error',
    };
  }

  const body = parse(event.body);
  const { trigger_id } = body;

  const res = await fetch('https://slack.com/api/views.open', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_OAUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
              text: 'Fill out this form to submit a new DXE request! Or, if you prefer, you can <https://google.com|create your request in Notion>. Requests are reviewed twice weekly. If your request is urgent, notify @jason.',
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
              text: 'When do you need it by?',
              emoji: true,
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
            },
            optional: true,
          },
          {
            block_id: 'urgency_block',
            type: 'input',
            label: {
              type: 'plain_text',
              text: 'Importance',
            },
            element: {
              action_id: 'urgency',
              type: 'static_select',
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: 'High',
                  },
                  value: 'high',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'Medium',
                  },
                  value: 'medium',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'Low',
                  },
                  value: 'low',
                },
              ],
            },
            optional: true,
          },
        ],
      },
    }),
  });

  // console.log(await res.json());

  return {
    statusCode: 200,
    body: '',
  };
};
