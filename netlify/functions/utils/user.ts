import { slackApi } from "./slack";

export const getUserEmailFromSlack = async (user_id) => {
  const slackUser = await slackApi(`users.info?user=${user_id}`);
  const email = slackUser.user?.profile?.email || false;

  console.log(`>> found email address: ${email}`);

  return email;
};
