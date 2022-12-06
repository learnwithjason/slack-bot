import type { Handler } from "@netlify/functions";
import { dailyBoostGeneric, dailyBoostHype } from "./utils/commonMessages";
import { getRandomHypeForUser, getUserByEmail, getUserHypes } from "./utils/db";

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

export const handler: Handler = async (event) => {
  HARDCODED_USERS.forEach(async (email) => {
    // get user id
    let userFromDb = await getUserByEmail(email);

    if (!userFromDb) {
      // continue to next loop as this user could not be found
      return;
    }

    hypeBoost(userFromDb[0]);
  });

  return {
    statusCode: 200,
    body: `WIP`,
  };
};

const hypeBoost = async (user) => {
  let selectedHype = await getRandomHypeForUser(user.id);

  // let message = ""

  if (!selectedHype) {
    // default in case no hype found, use generic prompt
    dailyBoostGeneric(HARDCODED_USER_ID, "Aashni");
  } else {
    // update message if Hype was found
    dailyBoostHype(HARDCODED_USER_ID, "Aashni", selectedHype[0].title);
  }
};
