// native
const util = require('util');

// third-party
const HWorkerServer = require('@habemus/amqp-worker/server');
const Bluebird      = require('bluebird');
const nodemailer    = require('nodemailer');
const urlWhitelist  = require('@habemus/url-whitelist');
const debug         = require('debug')('h-mailer');

// own
const MailRenderer = require('../lib/mail-renderer');

const errors = HWorkerServer.errors;

/**
 * Server constructor function
 * 
 * @param {Object} options
 */
function HMailerServer(options) {
  
  HWorkerServer.call(this, options);

  if (!options.transport) {
    throw new errors.InvalidOption('transport', 'required');
  }

  if (!options.destinationHostWhitelist) {
    throw new errors.InvalidOption('destinationHostWhitelist', 'required');
  }

  /**
   * The nodemailer instance
   * @type {nodemailer}
   */
  this.nodemailer = nodemailer.createTransport(options.transport);

  /**
   * Instance of MailRenderer
   */
  this.mailRenderer = new MailRenderer({
    templatesPath: options.templatesPath,
  });

  /**
   * Function that checks whether a url is whitelisted.
   * @type {Function}
   */
  this._isURLWhitelisted = urlWhitelist(options.destinationHostWhitelist);
}
util.inherits(HMailerServer, HWorkerServer);

/**
 * Expose errors
 * @type {Object}
 */
HMailerServer.errors = errors;

/**
 * Name of the mailer worker. MUST match in client and server.
 * 
 * @type {String}
 */
HMailerServer.prototype.name = 'h-mailer';

/**
 * The worker function
 * 
 * @param  {Object} payload
 * @param  {Object} logger
 * @return {Bluebird -> Object}
 */
HMailerServer.prototype.workerFn = function (payload, logger) {

  var template = payload.template;
  var from     = payload.from;
  var to       = payload.to;
  var data     = payload.data;

  debug('sendEmail', payload);

  return this.sendEmail(template, from, to, data);
};

/**
 * Checks if the email is whitelisted for sending.
 * 
 * @param  {String}  email
 * @return {Boolean}
 */
HMailerServer.prototype.isEmailWhitelisted = function (email) {

  var emailHost = email.split('@')[1];

  if (!emailHost) {
    return false;
  } else {
    return this._isURLWhitelisted(emailHost);
  }

};

/**
 * Renders the template requested and sends it.
 * 
 * @param  {String} template Name of the template
 * @param  {String} from
 * @param  {String} to
 * @param  {Object} data
 * @return {Bluebird}
 */
HMailerServer.prototype.sendEmail = function (template, from, to, data) {
  if (!template) {
    return Bluebird.reject(new errors.InvalidOption('template', 'required'));
  }

  if (!from) {
    return Bluebird.reject(new errors.InvalidOption('from', 'required'));
  }

  if (!to) {
    return Bluebird.reject(new errors.InvalidOption('to', 'required'));
  }

  // check if the 'to' is whitelisted
  if (!this.isEmailWhitelisted(to)) {
    debug('email not whitelisted', to);
    return Bluebird.reject(new errors.InvalidOption('to', 'notWhitelisted'));
  }

  data = data || {};

  var _mail;

  return this.mailRenderer.render(template, data)
    .then((mail) => {
      _mail = mail;

      // setup e-mail data
      var mailOptions = {
        from: from,
        to: to,
        subject: mail.subject,
        html: mail.body,
      };
      return new Bluebird((resolve, reject) => {
        this.nodemailer.sendMail(mailOptions, (err, sentEmailInfo) => {
          if (err) { reject(err); }

          // make sure to return nothing
          resolve();
        });
      });
    })
    .then(() => {

      var sentEmailInfo = {
        from: from,
        to: to,
        subject: _mail.subject
      };

      debug('email successfully sent', sentEmailInfo);

      return sentEmailInfo;
    })
    .catch((err) => {
      debug('error sending email', err);
      throw err;
    });

};

module.exports = HMailerServer;
