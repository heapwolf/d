
var fs = require('fs');
var cfg = require('../../config/config.json');
var pkg = require('../../package.json');
var common = require('../common');

var log = common.log;
//
// The usage for the actual command.
//
exports.usage = {
  '<name>': 'name of the signature',
  '[<key>': 'a private key (including the path) to be used for signing',
  '<phrase>]': 'the phrase issued by the service, required for signing'
};

//
// The verbose form of help, displayed in the repl or when 
// called with the `help` command.
//
exports.description = [
  'Manage the digital signatures that use your openSSL private key',
  'When only the name of the signature is provided, the specified',
  'signature will be assigned to the current project.'
];

//
// ### function command(args)
// #### @args {Array} An array that represents any subsequent
// arguments that appear after the command itself.
//
// The function to execute when the command is called.
//
exports.command = function(argv, config, callback) {

  var id = argv[0]; 
  var path = argv[1];
  var phrase = argv[2] || 'tiny clouds';

  if (argv.length >= 2) {

    fs.readFile(path, function(err, data) {

      if (err) {
        log(2, 'The path to the private key could not be found.');
      }
      else {

        var key = data.toString('ascii');
        var sign = crypto.createSign('SHA256');

        sign.update(phrase);

        cfg.signatures[id] = {
          hash: sign.sign(key, 'base64'),
          ctime: Date.now()
        };

        common.updateConfig(); 

        log(1, 'A digital signature has been created.');
      }
    });
  }
  else if (argv.length === 1) {

    cfg.repos[pkg.name] = cfg.signatures[id];
    common.updateConfig();
    
    log(1, '`' + config.repo + '` has been configured to use the `' + 
        id + '` signature');
  }
  else if (argv.length === 0) {

    //
    // prints all the digital signatures that have been created.
    //
    log(-1, '\r\nSIGNATURES'.underline + '\r\n');

    for (var key in cfg.signatures) {
      log(-1, '  ' + key + ' (' + 
        String(Date(cfg.signatures[key].ctime) + ')'));
    }
  }
 };

