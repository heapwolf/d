
var test = require('tap').test;
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');

//
// Prior to running this test, the following commands need to be run.
//

//
// generate a private key to use with your service
//
// $openssl genrsa -out nodejitsu_rsa 1024

//
// create a public key to share with the service
//
// $openssl rsa -in nodejitsu_rsa -pubout > nodejitsu_rsa.pub


var key = fs.readFileSync(path.join(process.env['HOME'], '.ssh/nodejitsu_rsa')).toString('ascii');
var pubkey = fs.readFileSync(path.join(process.env['HOME'], '.ssh/nodejitsu_rsa.pub')).toString('ascii');

var data = 'tiny clouds';

var sign = crypto.createSign('SHA256');
sign.update(data);

var Sig = sign.sign(key, 'base64');

var verify = crypto.createVerify('SHA256');
verify.update(data);

var verification = verify.verify(pubkey, Sig, 'base64');

test('The signature should be verified by the public key using the matching output format', function(t) {

  t.plan(1);
  t.ok(verification, 'The signature is valid');
});
