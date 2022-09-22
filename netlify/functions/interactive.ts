import type { Handler } from '@netlify/functions';
import { parse } from 'querystring';

import { getUserByEmail, RequestEntry } from './utils/notion';
import { blocks, properties, notionApi } from './utils/notion';
import { slackApi } from './utils/slack';

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 500, body: 'invalid payload' };
  }

  const body = parse(event.body);
  const payload = JSON.parse(body.payload as string);
  const values = payload.view.state.values;

  // simplify the data from Slack a bit
  const data = {
    title: values.title_block.title.value,
    date: values.date_block.date.selected_date,
    description: values.description_block.description.value,
    importance: values.importance_block.importance.selected_option,
  };

  // set the fields as Notion properties to populate the database entry
  const props: RequestEntry = {
    Name: properties.title(data.title),
  };

  // try to find the Notion user using the Slack user's email
  const slackUser = await slackApi(`users.info?user=${payload.user.id}`);
  const email = slackUser.user?.profile?.email || false;
  const notionUser = email ? await getUserByEmail(email) : false;

  if (notionUser && notionUser.id) {
    props['Submitted By'] = { people: [{ id: notionUser.id }] };
  }

  if (data.date) {
    props['Needed By'] = properties.date(data.date);
  }

  if (data.importance?.text?.text) {
    props['How big is the risk to Netlify if we don’t do this?'] =
      properties.select(data.importance.text.text);
  }

  // if a description was set, add it as the page content
  const children: object[] = [];

  if (data.description) {
    children.push(blocks.paragraph(data.description));
  }

  // create the request in Notion
  const notionRes = await notionApi('/pages', {
    parent: { database_id: process.env.NOTION_DB_ID },
    properties: props,
    children,
  });

  if (notionRes.object === 'error') {
    console.log(notionRes);
  }

  // build a permalink to the new request
  const requestLink = new URL('https://www.notion.so/');
  requestLink.pathname = `/${process.env.NOTION_DB_ID}`;
  requestLink.searchParams.set('p', notionRes.id.replace(/-/g, ''));
  requestLink.searchParams.set('pm', 's');

  // send a note to Slack so the team knows a new request has been sent
  await slackApi('chat.postMessage', {
    channel: process.env.SLACK_CHANNEL_ID,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `A <${requestLink.toString()}|new DXE request> was created by <@${
            payload.user.id
          }>.`,
        },
      },
    ],
  });

  return {
    statusCode: 200,
    body: '',
  };
};
