import type { RequestInit } from "node-fetch";
import { Client, collectPaginatedAPI } from "@notionhq/client";
import fetch from "node-fetch";

const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_TOKEN,
});

export async function getUserByEmail(email) {
  const users = await collectPaginatedAPI(notion.users.list, {
    page_size: 100,
  });

  const user = users.find((u) => {
    if (u.type !== "person") {
      return false;
    }

    return u.person.email === email;
  });

  return user;
}

type TitleProperty = {
  title: [{ text: { content: string } }];
};

type RichTextProperty = {
  rich_text: [
    {
      type: "text";
      text: { content: string };
    }
  ];
};

type DateProperty = {
  date: { start: string };
};

type PeopleProperty = {
  people: [{ id: string }];
};

type SelectProperty = {
  select: { name: string };
};

export type RequestEntry = {
  Name: TitleProperty;
  "Submitted By"?: PeopleProperty;
  "Needed By"?: DateProperty;
  "How big is the risk to Netlify if we don’t do this?"?: SelectProperty;
};

type ParagraphBlock = {
  type: "paragraph";
  paragraph: RichTextProperty;
};

export async function notionApi(endpoint: string, body?: object) {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOTION_INTEGRATION_TOKEN}`,
    },
  };

  if (body) {
    options.method = "POST";
    options.body = JSON.stringify(body);
  }

  return await fetch(`https://api.notion.com/v1${endpoint}`, options).then(
    (res) => res.json()
  );
}

export const properties = {
  title(title): TitleProperty {
    return {
      title: [
        {
          text: {
            content: title,
          },
        },
      ],
    };
  },
  richText(content): RichTextProperty {
    return {
      rich_text: [
        {
          type: "text",
          text: { content },
        },
      ],
    };
  },
  date(date): DateProperty {
    return {
      date: {
        start: date,
      },
    };
  },
  select(optionName): SelectProperty {
    return {
      select: {
        name: optionName,
      },
    };
  },
};

export const blocks = {
  paragraph(content): ParagraphBlock {
    return {
      type: "paragraph",
      paragraph: properties.richText(content),
    };
  },
};
