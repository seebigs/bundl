var featherTest = require('feather-test');
var utils = require('seebigs-utils');

featherTest.queue(utils.args().remote ? './specs/plugins/remote.spec.js' : './specs/plugins/local.spec.js');

featherTest.run();
