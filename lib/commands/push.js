
var request = require('request');
var common = require('../common');

var log = common.log;

//
// The usage for the actual command.
//
exports.usage = [
  "push [remote] [branch]"
];

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.help = [
  "Push".underline,
  "",
  "Push to the cloud."
];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
// #### @config {Object} An object literal containing the repo info.
//
// The function to execute when the command is called.
//
exports.command = function(argv, config, callback) {

  //
  // gather some information to form the origin for the commit.
  // but pass in config so that it can augmented if needed.
  //
  var origin = this.git.formulateOrigin(config);

  //
  // possible that the first arg is an alternative origin.
  //
  if (argv[0] && argv[0] !== 'origin') {
    origin = argv[0];
  }

  //
  // possible that the second arg is an alternative branch.
  //
  var branch = argv[1] || 'master';

  var args = ['push', origin, branch];

  this.git.exec(args, {}, function(err, output, callback) {

    if (err) {

      if (/up-to-date/.test(err)) {
        log(1, 'No new code to push'); 
        callback && callback();
      }
      else if(/\-\>/.test(err)) {
        log(0, 'Successful push!');
        callback && callback();
      }
    }
    else if (output) {
      log(0, 'success!');
      callback && callback();
    }
  });

};

