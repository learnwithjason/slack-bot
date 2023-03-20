# HypeDocs Slack App to let Slack users track hypes and goals, while celebrating everyone at the company

A slash command to let users add hypes and goals to their account.

This also sets up a [scheduled function](https://docs.netlify.com/netlify-labs/experimental-features/scheduled-functions/) to send daily hype boosts to engage users more

## Local Dev

### Env Vars

- `SLACK_BOT_OAUTH_TOKEN` — get one here: https://api.slack.com/apps
  - Required scopes: `channels:join`, `chat:write`, `commands`,

### Initial Setup

- Fork and initialize the repo

  ```sh
  # use the GitHub CLI because it rules
  gh repo fork learnwithjason/slack-bot

  # initialize a new Netlify site
  ntl init
  ```

- Start the server with a live tunnel

  ```sh
  ntl dev --live
  ```

- Create a new Slack slash command and set the Request URL to your live dev URL

  ```text
  https://<site_name>-<hash>.netlify.live/.netlify/functions/command
  ```

  <img src="docs/slack-slash-command.jpg" alt="Slack slash command config" width=400 />

- Turn on Slack Interactivity and set the Request URL to your live dev URL

  ```text
  https://<site_name>-<hash>.netlify.live/.netlify/functions/interactive
  ```

  <img src="docs/slack-interactivity.jpg" alt="Slack interactivity config" width=400 />

- Add the bot to the channel by visiting `/.netlify/invite-to-slack`

- Run the slash command to verify that things are working as expected

Once everything is verified working, deploy the site and update your Slack slash command and interactivity request URLs to use the production site.

## Local Testing

1. Start the server with a live tunnel

```ssh
ntl dev --live
```

2. Update URLs on Slack:

## Production URLS to update on Slack

- https://api.slack.com/apps/A04V1TG4RBK/interactive-messages
- https://api.slack.com/apps/A04V1TG4RBK/slash-commands
- https://api.slack.com/apps/A04V1TG4RBK/event-subscriptions
- Get shareable URL Link: https://app.slack.com/app-settings/T99HD5M6D/A04V1TG4RBK/distribute

## Staging URLS to update on Slack

- https://api.slack.com/apps/A01SU20000G/interactive-messages
- https://api.slack.com/apps/A01SU20000G/slash-commands
- https://api.slack.com/apps/A01SU20000G/event-subscriptions
- Get shareable URL Link: https://app.slack.com/app-settings/T019JD5PLKC/A01SU20000G/distribute

## Local URLS to update on Slack

- https://api.slack.com/apps/A047M3JV3A9/interactive-messages
- https://api.slack.com/apps/A047M3JV3A9/slash-commands
- https://api.slack.com/apps/A047M3JV3A9/event-subscriptions
- Get shareable URL Link: https://app.slack.com/app-settings/T99HD5M6D/A047M3JV3A9/distribute
