import { getValue } from "./enums";
// import MailerLite from "mailerlite-api-v2-node";
const MailerLite = require("mailerlite-api-v2-node").default;

const FULL_MAILERLITE_KEY = `${process.env.MAILERLITE_KEY}${getValue(
  "MAILERLITE_KEY"
)}`;
const mailerLite = new MailerLite(FULL_MAILERLITE_KEY);
const GROUP_ID = process.env.MAILERLITE_MEMBERS_GROUP_ID;

export const addUserToHDMailerlite = async (email, name) => {
  let subscriber = {
    email: email,
    fields: {
      name: name,
    },
  };

  await mailerLite.addSubscriberToGroup(GROUP_ID, subscriber);
};
