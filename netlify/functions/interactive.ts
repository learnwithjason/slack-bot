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

  if (payload.view.callback_id === "new-hype") {
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

    let firebaseUser = await getFirebaseUserFromSlackUser(payload.user.id);
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
