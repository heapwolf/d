
var fs = require('fs');
var config = require('../../config/config.json');
var sshconf = require('sshconf');

//
// The usage for the actual command.
//
exports.usage = {
  '[path]': 'the path to the private key that should be used for signing'
};

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.description = [
  'Manage the ssh keys that should be used for deploying and signing'
];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
//
// The function to execute when the command is called.
//
exports.command = function(argv, config, callback) {


  //
  // if there is path, the user is trying to specify a public key to use for this repo.
  //
  var path = argv[0];

  if (path) {

    var hosts = config.api.hosts;

    for (var i = 0, l = hosts.length; i < l; i++) {

      if (!sshconf.has(hosts[i].address)) {
        sshconf.add(path);
      }
      else {
        sshconf.append(path);
      }
    }

  }
  else {

    //
    // the user specified no arguments, they want a list of signed repos.
    //
    
  }

 };

