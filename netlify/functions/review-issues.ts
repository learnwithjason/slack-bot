import type { Handler } from '@netlify/functions';
import { schedule } from '@netlify/functions';

import { notionApi } from './utils/notion';
import { slackApi } from './utils/slack';

type NotionQuery = {
  results: [
    {
      id: string;
      properties: {
        Name: {
          title: [
            {
              plain_text: string;
            },
          ];
        };
        'Needed By': {
          date: {
            start: string;
          };
        };
      };
    },
  ];
};

const reviewIssues: Handler = async () => {
  const issues = (
    (await notionApi(`/databases/${process.env.NOTION_DB_ID}/query`, {
      filter: {
        property: 'Driver',
        people: {
          is_empty: true,
        },
      },
      sorts: [
        {
          property: 'Needed By',
          direction: 'ascending',
        },
      ],
    })) as NotionQuery
  ).results.map((issue) => {
    const requestLink = new URL('https://www.notion.so/');
    requestLink.pathname = `/${process.env.NOTION_DB_ID}`;
    requestLink.searchParams.set('p', issue.id.replace(/-/g, ''));
    requestLink.searchParams.set('pm', 's');

    const name = issue.properties.Name.title[0].plain_text;
    const date = issue.properties['Needed By'].date.start;

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `- <${requestLink.toString()}|${name}> (needed by ${date})`,
      },
    };
  });

  if (issues.length > 0) {
    let msg = `There are ${issues.length} requests that need review.`;

    if (issues.length === 1) {
      msg = `There is ${issues.length} request that needs review:`;
    }

    await slackApi('chat.postMessage', {
      channel: process.env.SLACK_CHANNEL_ID,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: msg,
          },
        },
        ...issues,
        { type: 'divider' },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Review <https://www.notion.so/${process.env.NOTION_DB_ID}|all open requests> on Notion.`,
            },
          ],
        },
      ],
    });
  }

  return {
    statusCode: 200,
  };
};

export const handler = schedule('0 6 * * 1,4', reviewIssues);
