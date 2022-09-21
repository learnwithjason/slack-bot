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
  const payload = JSON.parse(body.payload as string);
  const values = payload.view.state.values;

  console.log(JSON.stringify(payload));

  const data = {
    title: values.title_block.title.value,
    date: values.date_block.date.selected_date,
    description: values.description_block.description.value,
    urgency: values.urgency_block.urgency.selected_option,
  };

  console.log(data);

  const properties: any = {
    Name: {
      title: [
        {
          text: {
            content: data.title,
          },
        },
      ],
    },
    'Submitted By': {
      rich_text: [
        {
          text: {
            content: `@${payload.user.username}`,
          },
        },
      ],
    },
  };

  if (data.description) {
    properties.Description = {
      rich_text: [
        {
          text: {
            content: data.description,
          },
        },
      ],
    };
  }

  if (data.date) {
    properties['Needed By'] = {
      date: {
        start: data.date,
      },
    };
  }

  if (data.urgency?.text?.text) {
    properties.Urgency = {
      select: {
        name: data.urgency.text.text,
      },
    };
  }

  const notion = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NOTION_INTEGRATION_TOKEN}`,
    },
    body: JSON.stringify({
      parent: { database_id: '29f4a66d910f43a9b70b4c7eda097187' },
      properties,
      children: [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: data.description,
                },
              },
            ],
          },
        },
      ],
    }),
  }).then((res) => res.json());

  console.log(JSON.stringify(notion, null, 2));

  return {
    statusCode: 200,
    body: '',
  };
};
