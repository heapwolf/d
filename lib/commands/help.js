var common = require('../common');
var log = common.log;

//
// The usage for the actual command.
//
exports.usage = {
  '[command]': 'The command for which you would like some help'
};

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.description = [
  'Get help for a particular command you find listed here'
];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
//
// The function to execute when the command is called.
//
exports.command = function(args) {

  var command = args[0];
  var longlist = this.commands.longlist;

  if (command && longlist[command]) {

    //
    // if a second argument was provided, print its help and 
    // usage. do a check to make sure the item is defined before
    // showing the heading for it.
    //
    var item = longlist[command];

    item[1] && log(-1, '\r\nDESCRIPTION'.underline + '\r\n  ' + item[1]);
    item[2] && log(-1, '\r\nUSAGE'.underline + '\r\n  ' + command + ' ' + item[2]);
    item[3] && log(-1, '\r\nOPTIONS'.underline + '\r\n  ' + item[3]);
    item[4] && log(-1, '\r\nALIASES'.underline + '\r\n  ' + item[4]);
    
  }
  else {

    //
    // print all of the usage for each command
    //
    log(-1, '\nHELP'.underline + '\r\n  For more detailed help, use `help <command>`.\n');

    for (var command in longlist) {
      log(-1, '  ' + longlist[command][0] + ' ' + longlist[command][1]);
    }

    if (this.mode === 'REPL') {
      
      var length = longlist[command][0].length -3;
      var padding = '';

      for (var i = 0, l = length; i < l; i++) {
        padding += ' ';
      }

      log(-1, '  exit' + padding + 'Exit the REPL, also use `quit`, `q` or `.exit`\r\n');
    }
  }
};
