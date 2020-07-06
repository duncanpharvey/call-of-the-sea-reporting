var Slack = require('slack-node');
slack = new Slack();

function post(message) {
  slack.setWebhook(process.env.slack_postgres_webhook_url);
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