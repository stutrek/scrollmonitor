define(['../scrollMonitor'], function ( scrollMonitor ) {
  'use strict';

  window.scrollMonitor = scrollMonitor;
  window.chai = chai;
  window.expect = chai.expect;
  window.assert = chai.assert;
  window.should = chai.should();
  window.notrack = true;

  mocha.setup({
    ui: 'bdd'
  });

  require([
    '../test/tests', 

  ], function () {
    mocha.run();
  });
});
