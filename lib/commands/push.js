var request = require('request');
var common = require('../common');

var log = common.log;

//
// The usage for the actual command.
//
exports.usage = {
  '[remote]': 'the remote to which the code should be pushed',
  '[branch]': 'the branch at the origin to push to code to'
};

//
// The command's description.
//
exports.description = [
  'Push this project to the cloud as a new or existing app'
];

//
// as if the commands weren't short enough already, we can
// define as many aliases as we want for a command.
//
exports.alias = ['p'];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
// #### @config {Object} An object literal containing the repo info.
//
// The function to execute when the command is called.
//
exports.command = function(argv, config, callback) {

  var that = this;
  //
  // gather some information to form the origin for the commit.
  // but pass in config so that it can augmented if needed.
  //
  var remote = this.git.formulateRemote(config);
  var branch = 'master';
 
  //
  // possible that an alternative origin and branch were provided.
  //
  if (argv.length === 1) {

    branch = argv[0];
  }
  else if (argv.length === 2) {

    remote = argv[0];
    branch = argv[1];
  }

  var args = ['push', remote, branch, '--porcelain'];

  this.git.exec(args, {}, function(stderr, stdout, next) {

    if (stderr) {

      if (/failed connect/i.test(stderr) ||
          /failed to connect/i.test(stderr)) {
        
        log(1, 'The host is unresponsive');
        return next();
      }
      else if (/failed to push some refs/i.test(stderr)) {
        if (/non-fast-forward/.test(stderr)) {
          console.log(that.commands);
          //
          // need to commit and pull before pushing.
          //
        }
        else {

          log(1, 'More information is required to push');
          console.log(stderr);
          return callback(null);
        }
      }
      else if (/hung up unexpectedly/i.test(stderr)) {
        
        log(1, 'The host had a problem');
        return next();
      }
      else {
        console.log(stderr);
        log(2, 'Something went very wrong and we dont know what');
        return callback(stderr);
      }
    }
    else {

      if (/up to date/i.test(stdout)) {

        log(1, 'No new code to push'); 
      }
      else {

        log(0, 'The code was pushed, successfully!');
      }
      return callback(null);
    }
  });
};

