// third-party
const sgTransport   = require('nodemailer-sendgrid-transport');
const habemusEmails = require('habemus-emails');

// own
const HMailerServer = require('../server');

// env variables
var sendgridAPIKey           = process.env.SENDGRID_API_KEY;
var rabbitMQURI              = process.env.RABBIT_MQ_URI;
var destinationHostWhitelist = process.env.DESTINATION_HOST_WHITELIST;

if (!sendgridAPIKey) {
  throw new Error('SENDGRID_API_KEY is required');
}

if (!rabbitMQURI) {
  throw new Error('RABBIT_MQ_URI is required');
}

// this is mainly to prevent accidental email sending
// in test environments the DESTINATION_HOST_WHITELIST should be set to
// `habem.us` so that only emails sent to user@habem.us accounts are actually sent
if (!destinationHostWhitelist) {
  throw new Error('DESTINATION_HOST_WHITELIST is required');
}

var hMailer = new HMailerServer({
  transport: sgTransport({
    auth: {
      api_key: sendgridAPIKey,
    }
  }),
  templatesPath: habemusEmails.templatesPath,
  destinationHostWhitelist: destinationHostWhitelist,
});

hMailer.connect(rabbitMQURI).then(() => {
  console.log('hMailer successfully connected');
});
