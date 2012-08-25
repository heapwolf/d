
var assert = require('assert'),
    dt = require('../../lib/deploytool');

module.exports = {

  'attempt to push to server': function (t) {

     dt.push(function (err, data) {

      assert.ok(!err);
      assert.ok(data instanceof Buffer);
      assert.equal(data.toString(), 'abc\ndef\n123\n');
      t.finish();
    });
  },


  'attempt to push to server, fail on default and recover using alternative': function (t) {

    //
    // make an attempt to connect to a non existing api end point.
    //
    dt.api.hosts[0] = ['foobarbazzbuzz.com', 666];

    //
    // make an attempt to push to it and hopefully fail.
    //
    dt.push(function (err, data) {

      assert.ok(!err);
      assert.ok(data instanceof Buffer);
      assert.equal();
      t.finish();
    });
  },

};
