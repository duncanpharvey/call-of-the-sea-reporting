var Slack = require('slack-node');
slack = new Slack();

function post(message, webhook = process.env.slack_postgres_webhook_url) { // todo: update files that use this to remove default for backwards compatibility
  slack.setWebhook(webhook);
  if (process.env.NODE_ENV == "test") return;
  console.log(message);
  slack.webhook({
    channel: process.env.slack_channel,
    text: message,
  }, function (err, response) {
    if (err) { console.log(`failed to post message to slack: ${err}`); }
  });
}

module.exports = {
  post: post
};