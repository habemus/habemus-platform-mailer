// third-party
const sgTransport   = require('nodemailer-sendgrid-transport');
const habemusEmails = require('habemus-emails');

// own
const HMailerServer = require('../server');

// env variables
var sendgridAPIKey = process.env.SENDGRID_API_KEY;
var rabbitMQURI    = process.env.RABBIT_MQ_URI;

if (!sendgridAPIKey) {
  throw new Error('SENDGRID_API_KEY is required');
}

if (!rabbitMQURI) {
  throw new Error('RABBIT_MQ_URI is required');
}

var hMailer = new HMailerServer({
  transport: sgTransport({
    auth: {
      api_key: sendgridAPIKey,
    }
  }),
  templatesPath: habemusEmails.templatesPath,
});

hMailer.connect(rabbitMQURI).then(() => {
  console.log('hMailer successfully connected');
});
