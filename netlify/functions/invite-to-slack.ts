import type { Handler } from '@netlify/functions';

import { slackApi } from './utils/slack';

export const handler: Handler = async () => {
  await slackApi('conversations.join', {
    channel: process.env.SLACK_CHANNEL_ID,
  });

  return {
    statusCode: 200,
    body: 'check to see that your bot joined the right Slack channel',
  };
};
