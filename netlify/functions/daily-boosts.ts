import type { Handler } from "@netlify/functions";
import { schedule } from "@netlify/functions";
import {
  dailyHypeBoostGeneric,
  dailyGoalBoostGeneric,
  dailyBoostGoal,
  dailyBoostHype,
  dailyBoostMotivation,
} from "./utils/commonMessages";
import {
  getRandomGoalForUser,
  getRandomHypeForUser,
  getSlackAccounts,
  getSlackUsers,
} from "./utils/db";
import { getRandomQuote } from "./utils/quotes";

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

// use this version for the scheduler - works for local calls as well
const dailyBoosts: Handler = async (event) => {
  // use this version to test the function directly in production
  //  note: will need to deploy to production.
  // export const handler: Handler = async (event) => {
  console.log(`start of daily boost flow`);
  let usersOnSlack = await getUsersOnSlack();

  // creating an object of all the promises to ensure we execute
  // all of them before return is called
  const slackMessagesPromise = Object.keys(usersOnSlack).map(async (user) => {
    let userInfo = usersOnSlack[user].user_info;
    let slackInfo = usersOnSlack[user].slack_accounts;

    // 0-6 for days of the week, 0 = Sunday
    // mon, thurs = goals, tues, fri = hypes, wed = motivation
    let day = new Date().getDay();

    if (day === 2 || day === 5) {
      await hypeBoost(userInfo, slackInfo);
    } else if (day === 1 || day === 4) {
      await goalBoost(userInfo, slackInfo);
    } else if (day === 3) {
      await motivationalBoost(userInfo, slackInfo);
    } else {
      // weekend, don't send a boost message out
    }
  });

  await Promise.all(slackMessagesPromise);

  return {
    statusCode: 200,
    body: `Success`,
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
    }
  }

  return allSlackUsers;
};

const hypeBoost = async (user, slack) => {
  let selectedHype = await getRandomHypeForUser(user.user_id);
  console.log(`selectedHype: ${JSON.stringify(selectedHype)}`);

  if (selectedHype.length === 0) {
    console.log(`sending generic hype to: ${user.name}`);
    // default case, user has no hypes so send a generic prompt
    await dailyHypeBoostGeneric(
      user.user_slack_id,
      user.name ? user.name : user.slack_username,
      slack[0].access_token
    );
  } else {
    console.log(`sending hype to: ${user.name} - ${selectedHype[0].title}`);
    await dailyBoostHype(
      user.user_slack_id,
      user.name ? user.name : user.slack_username,
      selectedHype[0].title,
      slack[0].access_token
    );
  }
};

const goalBoost = async (user, slack) => {
  let selectedGoal = await getRandomGoalForUser(user.user_id);

  if (!selectedGoal) {
    // default in case no hype found, use generic prompt
    console.log(`sending generic goal to: ${user.name}`);
    await dailyGoalBoostGeneric(
      user.user_slack_id,
      user.name ? user.name : user.slack_username,
      slack[0].access_token
    );
  } else {
    // update message if Hype was found
    console.log(`sending goal to: ${user.name} - ${selectedGoal[0].title}`);
    await dailyBoostGoal(
      user.user_slack_id,
      user.name ? user.name : user.slack_username,
      selectedGoal[0].title,
      slack[0].access_token
    );
  }
};

const motivationalBoost = async (user, slack) => {
  let motivationalBoost = getRandomQuote();

  await dailyBoostMotivation(
    user.user_slack_id,
    user.name ? user.name : user.slack_username,
    motivationalBoost,
    slack[0].access_token
  );
};

// schedule this to run every weekday at 12 noon GMT, 10am EST
export const handler = schedule("7 14 * * 1-5", dailyBoosts);
