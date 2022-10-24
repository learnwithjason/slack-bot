import { getUserGoals, getUserByEmail } from "./db";
import { slackApi } from "./slack";

export const getUserEmailFromSlack = async (user_id) => {
  const slackUser = await slackApi(`users.info?user=${user_id}`);
  const email = slackUser.user?.profile?.email || false;

  return email;
};

export const getFirebaseUserFromSlackUser = async (user_id) => {
  const slackEmail = await getUserEmailFromSlack(user_id);
  const firebaseUser = !!slackEmail ? await getUserByEmail(slackEmail) : {};
  return firebaseUser;
};

export const getUserGoalOptionsFromFirebase = async (user_id) => {
  const goalsFromFirebase = await getUserGoals(user_id);

  const goalOptions = goalsFromFirebase.map((goal) => {
    return {
      text: {
        type: "plain_text",
        text: goal.title,
        emoji: true,
      },
      value: goal.id,
    };
  });

  return goalOptions;
};
