var Slack = require('slack-node');

slack = new Slack();
slack.setWebhook(process.env.slack_webhook_url);

function post(message) {
  slack.webhook({
    channel: process.env.slack_channel,
    text: message,
  }, function(err, response) {
      if (err) {
          console.log('failed to post message to slack: ' + err);
      }
      else {
        console.log('posted message to slack: ' + message);
      }
  });
}

exports.post = post;