
var request = require('request');
var colors = require('colors');

//
// The usage for the actual command.
//
exports.usage = [
  "info"
];

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.help = [
  "info".underline,
  "",
  "Get information about a deployment"
];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
//
// The function to execute when the command is called.
//
exports.command = function(args) {

  var url = path.join([this.api.root, this.api.login]);

  /*
 
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Print the google web page.
    }
  ); 

  */
};

