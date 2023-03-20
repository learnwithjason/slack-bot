import type { Handler } from "@netlify/functions";
import {
  dailyBoostGeneric,
  dailyBoostGoal,
  dailyBoostHype,
  dailyBoostMotivation,
} from "./utils/commonMessages";
import {
  getRandomGoalForUser,
  getRandomHypeForUser,
  getSlackAccounts,
  getSlackUsers,
  getUserByEmail,
  getUserHypes,
} from "./utils/db";

/**
 * Send daily boosts to users based on submitted hypes and goals
 *
 * [ ] get list of users
 *      [ ] NOTE: hard coded for now/testing purposes
 * [ ] determine what type of boost
 *      [x] hype boost:
 *           [x] get list of hypes, pick one at random and send as a message
 *      [ ] goal boost:
 *           [ ] get list of goals, pick one at random and send as a message
 *      [ ] motivation:
 *           [ ] pick motivation from random provided list
 *
 */

// TODO(aashni): update to use real values, not hardcoded ones
let HARDCODED_USERS = ["contact@aashni.me"];
let HARDCODED_USER_ID = "U9A18B2M9";
let HARDCODED_AUTH_TOKEN = process.env.SLACK_BOT_OAUTH_TOKEN;

export const handler: Handler = async (event) => {
  console.log(`inside daily-boosts`);

  let usersOnSlack = await getUsersOnSlack();

  Object.keys(usersOnSlack).map(async (user) => {
    // console.log(
    //   `user: ${user} | usersOnSlack[user]: ${JSON.stringify(
    //     usersOnSlack[user]
    //   )}`
    // );
    let userInfo = usersOnSlack[user].user_info;
    let slackInfo = usersOnSlack[user].slack_accounts;
    await hypeBoost(userInfo, slackInfo);

    //   // 0-6, 0 = Sunday
    // let day = new Date().getDay();

    // // if (day == 2 || day == 4) {
    // if (day == 230) {
    //   hypeBoost(user);
    //   // } else if (day == 1 || day == 3) {
    // } else if (day == 0) {
    //   goalBoost(user);
    // } else {
    //   motivationalBoost(user);
    // }
  });

  // console.log(`usersOnSlack: ${JSON.stringify(usersOnSlack)}`);

  // usersOnSlack.forEach(async (user) => {
  //   console.log(`user: ${JSON.stringify(user)}`);
  // });

  // HARDCODED_USERS.forEach(async (email) => {
  //   // get user id
  //   let userFromDb = await getUserByEmail(email);

  //   if (!userFromDb) {
  //     // continue to next loop as this user could not be found
  //     return;
  //   }

  //   // 0-6, 0 = Sunday
  //   let day = new Date().getDay();

  //   // if (day == 2 || day == 4) {
  //   if (day == 230) {
  //     hypeBoost(userFromDb[0]);
  //     // } else if (day == 1 || day == 3) {
  //   } else if (day == 0) {
  //     goalBoost(userFromDb[0]);
  //   } else {
  //     motivationalBoost(userFromDb[0]);
  //   }
  // });

  return {
    statusCode: 200,
    body: `Success: ${JSON.stringify(usersOnSlack)}`,
  };
};

const getUsersOnSlack = async () => {
  let allSlackUsers = {};

  let slackAccounts = await getSlackAccounts();

  for (let account in slackAccounts) {
    let slackAccount = slackAccounts[account];
    let slackId = slackAccount.id;
    let slackUsers = await getSlackUsers(slackId);

    for (let user in slackUsers) {
      let userId = slackUsers[user].id;

      if (allSlackUsers[userId] && !!allSlackUsers[userId].slack_accounts) {
        allSlackUsers[userId].slack_accounts.push(slackId);
      } else {
        allSlackUsers[userId] = {
          user_info: slackUsers[user],
          slack_accounts: [slackAccount],
        };
      }
      console.log(`allSlackUsers: ${JSON.stringify(allSlackUsers)}`);
    }
  }

  return allSlackUsers;
};

const hypeBoost = async (user, slack) => {
  console.log(`\n\n>>>>>>>>>>>>>>>>>>>>>>>>\n\n`);
  console.log(`slack: ${JSON.stringify(slack)}`);
  // console.log(`hypeboost, user: ${JSON.stringify(user)}`);
  let selectedHype = await getRandomHypeForUser(user.user_id);
  // console.log(
  //   `\nuser: ${user.user_id} | selectedHype: ${JSON.stringify(selectedHype)}\n`
  // );

  if (selectedHype.length === 0) {
    // default case, user has no hypes so send a generic prompt
    let resp = await dailyBoostGeneric(
      user.user_slack_id,
      user.name ? user.name : user.slack_username,
      slack[0].access_token
    );
    console.log(`resp: ${JSON.stringify(resp)}\n\n`);
  } else {
    let resp = await dailyBoostHype(
      user.user_slack_id,
      user.name ? user.name : user.slack_username,
      selectedHype[0].title,
      slack[0].access_token
    );
    console.log(`resp: ${JSON.stringify(resp)}\n\n`);
  }

  // if (!selectedHype) {
  //   // default in case no hype found, use generic prompt
  //   dailyBoostGeneric(HARDCODED_USER_ID, "Aashni", HARDCODED_AUTH_TOKEN);
  // } else {
  //   // update message if Hype was found
  //   dailyBoostHype(
  //     HARDCODED_USER_ID,
  //     "Aashni",
  //     selectedHype[0].title,
  //     HARDCODED_AUTH_TOKEN
  //   );
  // }
};

// const hypeBoost = async (user) => {
//   let selectedHype = await getRandomHypeForUser(user.id);

//   if (!selectedHype) {
//     // default in case no hype found, use generic prompt
//     dailyBoostGeneric(HARDCODED_USER_ID, "Aashni", HARDCODED_AUTH_TOKEN);
//   } else {
//     // update message if Hype was found
//     dailyBoostHype(
//       HARDCODED_USER_ID,
//       "Aashni",
//       selectedHype[0].title,
//       HARDCODED_AUTH_TOKEN
//     );
//   }
// };

const goalBoost = async (user) => {
  let selectedGoal = await getRandomGoalForUser(user.id);

  if (!selectedGoal) {
    // default in case no hype found, use generic prompt
    dailyBoostGeneric(HARDCODED_USER_ID, "Aashni", HARDCODED_AUTH_TOKEN);
  } else {
    // update message if Hype was found
    dailyBoostGoal(
      HARDCODED_USER_ID,
      "Aashni",
      selectedGoal[0].title,
      HARDCODED_AUTH_TOKEN
    );
  }
};

const motivationalBoost = async (user) => {
  let motivationalBoost = "This is a motivational boost";

  if (!motivationalBoost) {
    // default in case no hype found, use generic prompt
    dailyBoostGeneric(HARDCODED_USER_ID, "Aashni", HARDCODED_AUTH_TOKEN);
  } else {
    // update message if Hype was found
    dailyBoostMotivation(
      HARDCODED_USER_ID,
      "Aashni",
      HARDCODED_AUTH_TOKEN,
      motivationalBoost
    );
  }
};
