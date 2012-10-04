
var pushover = require('pushover');
var argv = require('optimist').argv;
var uuid = require('node-uuid');
var crypto = require('crypto');
var https = require('https');
var fs = require('fs');

var store = '/tmp/repos/';
var repos = pushover(store);

repos.on('push', function (push) {
  console.log('push ' + push.repo + '/' + push.commit
    + ' (' + push.branch + ')'
  );
  push.accept();
});

repos.on('fetch', function (fetch) {
  console.log('fetch ' + fetch.repo + '/' + fetch.commit);
  fetch.accept();
});


var options = {
  key: fs.readFileSync('CA/key.pem'),
  cert: fs.readFileSync('CA/cert.pem')
};

var tokens = {};

//
// at interval, select a random item out of the tokens hash
// and remove it if it has existed for more than 1 minutes.
//
setTimeout(function() {
  
  var keys = Object.keys(tokens);
  var token = keys[Math.random() * (keys.length - 1)];

  if (token) {

    var now = new Date(Date.now());
    var ctime = new Date(tokens[token].ctime);
    var threshold = ctime.setMinutes(now.getMinutes + 1);

    if (threshold < now) {
      delete tokens[token];
    }
  }
}, 30000);

//
// In order to leverage public key infrastructure,
// accept a private key over https and compare it to
// the public key that has already on the server.
//
// Doesn't this represent an extraneous request? No.
//
// Say you run git push origin master in your project, and 
// origin is defined as a URL that uses the SSH protocol. 
// Git fires up the send-pack process, which initiates a 
// connection over SSH to your server. It tries to run a 
// command on the remote server via an SSH call. This requires
// a process to run on the server which can get pricy in high
// concurrency scenarios.
//
// The git-receive-pack command immediately responds with 
// one line for each reference it currently has.
//
// Now that it knows the server’s state, your send-pack 
// process determines what commits it has that the server 
// doesn’t. For each reference that this push will update, 
// the send-pack process tells the receive-pack process that 
// information.
//
// In our case there is a single negotiation step before the
// git child process contacts the server via https.
//
https.createServer(options, function (req, res) {

  //
  // the pattern for an authorization request is
  // `/auth/user/repo`
  //
  var match = req.url.match(/\/auth\/(.*?)\/(.*?)/);

    var signature = '';
    var user = match[1];
    var repo = match[2];

    req.on('data', function(chunk) {

      signature += chunk;

      //
      // 1232 bytes is compatible with a 2048-bit 
      // RSA key encoded in PKCS#8 format. If the key
      // is larger than this it is likely that there
      // is something going wrong. end the request.
      //
      if (signature.length > 1232) {
        res.end();
      }
    });

    req.on('end', function() {

      if (match) {

        //
        // only serve this if the public key matches.
        //
        

        // 
        // find the user's root directory and get the public key
        // so that we can compare it with the public key extracted
        // from the private key that is currently in the buffer.
        //
        fs.readFile(
          path.join(store, user),
          function(err, key) {
            if (err) {
              res.end(err);
            }
            else {

              var verify = crypto.createVerify('SHA256');
              verify.update(data);

              if (verify.verify(key, signature, 'base64') {

                var token = uuid.v4();

                //
                // Store the new uuid as a key in the tokens hash.
                // also store the user and repo so that we can be sure
                // that 
                //
                tokens[token] = {
                  ctime: Date.now(),
                  user: user,
                  repo: repo
                };

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');

                var response = JSON.stringify({ token: token });
                res.end(response);
              }
              else {
                res.statusCode = 405;
                res.end();
              }

            }
          }
        );

      }
      else {

        //
        // if this is not a match for credential validation, 
        // the URL must start with a token. if the token is
        // in the tokens hash, we can accept this request and
        // remove the token from the hash.
        //
        var token = req.url.match(/\/(.*?)\//);

        if (tokens[token[1]]) {
          delete tokens[token[1]];
          repos.handle(req, res);
        }
      }
    });

}).listen(argv.p || 8000);

