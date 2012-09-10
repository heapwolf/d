
var request = require('request');

//
// The usage for the actual command.
//
exports.usage = {
  '[tag|sha1]': 'The tag or the sha1 hash to identify the code to use'
};

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.description = [
  'Pull the latest code that has been pushed to the cloud'
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

  var args = ["pull", "-z", "--summary", version, "--", path];

  this.git.exec(args, function() {

    // ...
  });

 };

