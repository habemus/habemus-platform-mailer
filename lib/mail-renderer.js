// native
const fs   = require('fs');
const path = require('path');

// third-party
const mustache = require('mustache');
const Bluebird = require('bluebird');
const cheerio  = require('cheerio');

// promisification
Bluebird.promisifyAll(fs);

/**
 * Email renderer constructor
 * 
 * @param {Object} options
 *        - templatesPath
 */
function MailRenderer(options) {

  if (!options.templatesPath) {
    throw new Error('templatesPath is required');
  }

  /**
   * The path to the root templates directory path
   * @type {String}
   */
  this.templatesPath = options.templatesPath;
}

/**
 * Function that renders the template identified by the templateName
 * using the given data
 * 
 * @param  {String} templateName
 * @param  {Object} data
 * @return {Bluebird -> Object}
 *                      - subject
 *                      - body
 */
MailRenderer.prototype.render = function (templateName, data) {

  var templatePath = path.join(this.templatesPath, templateName);

  return fs.readFileAsync(templatePath, 'utf8')
    .then((templateContents) => {

      return mustache.render(templateContents, data);
    })
    .then((rendered) => {

      var $email = cheerio.load(rendered);

      var title = $email('title');

      return {
        subject: title.text(),
        body: rendered,
      };
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return Bluebird.reject(new Error('templateNotFound'));
      } else {
        return Bluebird.reject(err);
      }
    });
};

module.exports = MailRenderer;
