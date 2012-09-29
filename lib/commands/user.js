
var request = require('request');
var colors = require('colors');

//
// The usage for the actual command.
//
exports.usage = {};

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.description = [
  'Show the current user configuration information'
];

exports.alias = ['whoami'];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
//
// The function to execute when the command is called.
//
exports.command = function(args) {

  if (args.length === 0) {
    this.git.whoami();
  }
};

