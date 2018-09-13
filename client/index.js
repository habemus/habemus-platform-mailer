// native
const util = require('util');

// third-party
const HWorkerClient = require('@habemus/amqp-worker/client');

const errors = HWorkerClient.errors;

/**
 * Builder client constructor
 * @param {Object} options
 */
function HMailerClient(options) {
  HWorkerClient.call(this, options);
}
util.inherits(HMailerClient, HWorkerClient);

/**
 * Expose errors as static property
 * @type {Object}
 */
HMailerClient.errors = errors;

/**
 * Name of the mailer worker
 * @type {String}
 */
HMailerClient.prototype.name = 'h-mailer';

module.exports = HMailerClient;
