// native
const fs   = require('fs');
const path = require('path');

// third-party
const should = require('should');
const mockery = require('mockery');
const mustache = require('mustache');

const stubTransort = require('nodemailer-stub-transport');

const FIXTURES_PATH = path.join(__dirname, '../fixtures');

describe('HMailerServer', function () {

  // HMailerServer will be required inside the beforeEach loop
  var HMailerServer;

  beforeEach(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // mock h-worker module and make it respond with the correct data
    function HWorkerServerMock() {}
    HWorkerServerMock.errors = {
      InvalidOption: Error,
    }
    mockery.registerMock('h-worker/server', HWorkerServerMock);

    // re-require the h-mailer-server
    HMailerServer = require('../../server');
  });

  afterEach(function () {
    mockery.disable();
  });

  describe('#sendEmail(template, from, to, data)', function () {

    it('should send an email through the nodemailer transport', function (done) {

      var transport = stubTransort();

      var server = new HMailerServer({
        transport: transport,
        templatesPath: path.join(FIXTURES_PATH, 'templates'),
        destinationHostWhitelist: '*',
      });

      // email sending configuration
      var fromEmail  = 'from@habem.us';
      var toEmail    = 'to@habem.us';
      var renderData = {
        user: {
          name: 'User One',
        }
      };

      // add listener to the log event of the node mailer stub transport
      transport.on('log', function (log) {
        if (log.type === 'message') {

          var rendered = mustache.render(
            fs.readFileSync(path.join(FIXTURES_PATH, 'templates/deep/template-2.html'), 'utf8'),
            renderData
          );

          var match = log.message.indexOf(rendered) !== -1;

          if (match) {
            done();
          }
        }
      });

      server.sendEmail('deep/template-2.html', fromEmail, toEmail, renderData);
    });

  });

});
