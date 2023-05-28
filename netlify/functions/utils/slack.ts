import type { RequestInit } from "node-fetch";
import fetch from "node-fetch";

export function slackApi(endpoint: string, authToken, body?: object) {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
  };

  if (body !== undefined) {
    options.method = "POST";
    options.body = JSON.stringify(body);
  }

  return fetch(`https://slack.com/api/${endpoint}`, options).then((res) =>
    res.json()
  );
}
