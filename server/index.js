// native
const util = require('util');

// third-party
const HWorkerServer = require('h-worker/server');
const Bluebird      = require('bluebird');
const nodemailer    = require('nodemailer');

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

  return this.sendEmail(template, data);
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

  data = data || {};

  return this.mailRenderer.render(template, data)
    .then((mail) => {

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
          resolve(sentEmailInfo);
        });
      });
    });

};

module.exports = HMailerServer;
