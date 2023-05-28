import type { Handler } from "@netlify/functions";
import { parse } from "querystring";
// import { getSlackOptionsFromFirebase } from "./utils/user";
import {
  getSlackAccounts,
  getSlackListBySlackIds,
  getSlackUsersByUId,
  getUserSlackFromUserSlackId,
} from "./utils/db";
import { SLACK_ACTIONS } from "./utils/enums";

// export const getSlackOptionsFromFirebase = async (userSlackId) => {
//   console.log(`userSlackId: ${userSlackId}`);
//   let slackOptions: object[] = [];

//   // const userId = await getUserSlackFromUserSlackId(userSlackId);
//   // console.log(`userId: ${userId}`);
//   // const slackOptionsFromFirebase = await getSlackUsersByUId(userId);

//   let tempUserId = "i92Vh0rW1vRjQPprmpf0niIQAkJ3";
//   const slackOptionsFromFirebase = await getSlackUsersByUId(tempUserId);

//   console.log(
//     `slackOptionsFromFirebase: ${JSON.stringify(slackOptionsFromFirebase)}`
//   );

//   if (slackOptionsFromFirebase.length === 0) {
//     slackOptions.push({
//       text: {
//         type: "plain_text",
//         text: "No other sources - add one in Settings",
//       },
//       value: "NO_ALT_INTEGRATIONS",
//     });
//   } else {
//     let slackList = await getSlackListBySlackIds(slackOptionsFromFirebase);
//     console.log(`\n\nslackList: ${JSON.stringify(slackList)}`);

//     slackList.forEach((option) => {
//       slackOptions.push({
//         text: {
//           type: "plain_text",
//           text: `#${option.wins_channel_name} in ${option.team_name}`,
//         },
//         value: `${option.id}`,
//       });
//     });
//   }

//   console.log(`\n\slackPptions: ${JSON.stringify(slackOptions)}`);

//   return slackOptions;
// };

// we have users' slack id
//  get hypedocs user id from user's slack id using usersSlack table
//  get list of slacks the user is in from usersSlack table

export const getSlackOptionsFromFirebase = async (userSlackId) => {
  const slackUserAccounts = await getSlackUsersByUId(userSlackId);
  console.log(`userid:${userSlackId}`);
  console.log(`slackUserAccount: ${JSON.stringify(slackUserAccounts)}`);
  const slackOptionsFromFirebase = await getUserSlackFromUserSlackId(
    "U9A18B2M9"
  );
  console.log(`testing: ${JSON.stringify(slackOptionsFromFirebase)}`);

  let slackOptions: object[] = [];

  if (slackOptionsFromFirebase.length === 0) {
    slackOptions.push({
      text: {
        type: "plain_text",
        text: "No integrations - add one in Settings",
      },
      value: SLACK_ACTIONS.NO_ALT_INTEGRATIONS,
    });
  } else {
    slackOptionsFromFirebase.forEach((option) => {
      slackOptions.push({
        text: {
          type: "plain_text",
          text: `${option.team_name}`,
        },
        value: `${option.id}`,
      });
    });
  }

  console.log(`\n\slackOptions: ${JSON.stringify(slackOptions)}`);

  return slackOptions;
};

export const handler: Handler = async (event) => {
  if (!event.body) {
    return { statusCode: 500, body: "invalid payload" };
  }

  const body = parse(event.body);
  if (!body.payload) {
    return { statusCode: 500, body: "invalid payload" };
  }
  const payload = JSON.parse(body.payload as string);
  console.log(`body keys:${Object.keys(body)}`);
  console.log(`\n\npayload: ${JSON.stringify(payload.user.id)}`);

  const isMultiExternalSelect = payload.view?.blocks?.some(
    (block) =>
      block.accessory && block.accessory.type === "multi_external_select"
  );

  if (!isMultiExternalSelect) {
    return {
      statusCode: 500,
      body: "Error - not a multi external select payload request",
    };
  }

  const shareOptions = await getSlackOptionsFromFirebase(payload.user.id);

  let responseBody = {
    options: shareOptions,
  };

  console.log(`responseBody: ${JSON.stringify(responseBody)}`);

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
