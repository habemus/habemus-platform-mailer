// third-party
const sgTransport   = require('nodemailer-sendgrid-transport');
const habemusEmails = require('habemus-emails');
const envOptions    = require('@habemus/env-options');

// own
const HMailerServer = require('../server');

var options = envOptions({
  sendgridAPIKey: 'fs:SENDGRID_API_KEY_PATH',
  rabbitMQURI: 'fs:RABBIT_MQ_URI_PATH',
  templatesPath: habemusEmails.templatesPath,
  destinationHostWhitelist: 'list:DESTINATION_HOST_WHITELIST',
});

options.transport = sgTransport({
  auth: {
    api_key: options.sendgridAPIKey,
  }
});

var hMailer = new HMailerServer(options);

/**
 * Exit process in case of connection failure.
 * Allow environment to manage restart.
 */
hMailer.on('channel-close', (e) => {
  console.warn('hMailer channel closed (connection lost)', e);
  process.exit(1);
});

hMailer.connect(options.rabbitMQURI).then(() => {
  console.log('hMailer successfully connected');
})
.catch((err) => {
  console.warn('hMailer error connecting', err);
  process.exit(1);
});
