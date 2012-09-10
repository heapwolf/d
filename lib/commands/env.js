
var request = require('request');
var common = require('../common');
var colors = require('colors');
var argv = require('optimist').argv;
var config = require('../../config/config.json');

var log = common.log;

//
// The usage for the actual command.
//
exports.usage = {
  '[set <key> <value>]': 'Set a particular key to become the given value. Overwrites by default',
  '[get <key>]': 'Get the value for a particular key, `null` is returned if a value was never set',
  '[-j]': 'Output all of the keys as JSON without any heading, also accepts `--json`.'
};

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.description = [
  'Get and set environment variables for this application'
];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
//
// The function to execute when the command is called.
//
exports.command = function(args) {

  var output;
  var keys = Object.keys(config.env); 
  
  //
  // a simple function that prints all the environment variables.
  //
  var printAll = function printAll() {

    log(-1, '\r\nENVIRONMENT VARIABLES'.underline + '\r\n');

    for (var key in config.env) {
      log(-1, '  ' + key + '=' + config.env[key]);
    }
  }

  //
  // if no environment variables have been set, initialize the 
  // environment object so we can start storing stuff on it.
  //
  if (!config.env) {
    config.env = {};
  }
  //
  // in the case that this is a `set`, ensure that there are at 
  // least two more variables.
  //
  if (args.length === 3 && args[0] === 'set') {
    config.env[args[1]] = args[2];
    common.updatePackage();
  }

  //
  // in the case that this is a `get`, we need at least one more 
  // key, if we dont get it, print all of the items.
  //
  else if (args[0] === 'get') {

    if (args.length === 2 && config.env[args[1]]) {
      output = config.env[args[1]];
    }
    else if (keys.length > 0) {
      printAll();
    }
  }
  else if (args.length === 0 && (argv.json || argv.j)) {
    log(-1, JSON.stringify(config.env, true, 2));
  }
  else if (keys.length > 0) {
    printAll();
  }
  else {
    log(1, 'no environment variables have been set.');
  }

};

