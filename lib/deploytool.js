
var common = require('./common');
var path = require('path');

//
// api calls
//
exports.api = {};

api.getRootApi = function() {};

//
// Git wrapper
//
exports.git = {};

var gitENOENT = /fatal: (Path '([^']+)' does not exist in '([0-9a-f]{40})'|ambiguous argument '([^']+)': unknown revision or path not in the working tree.)/;
var dir, commands, defaults, workTree; 

try {

  //
  // Check is this is a working repo
  //
  dir = path.join(repo, ".git")
  fs.statSync(dir);
  workTree = __dirname;
  defaults = ["--git-dir=" + dir, "--work-tree=" + workTree];
}
catch (e) {

  dir = __dirname;
  defaults = ["--git-dir=" + dir];
}

//
// execute a git command, optionally specify the
// encoding. last callback should be a callback.
//
git.exec(commands, encoding) {

  var callback;

  if (arguments.length === 2) {
    callback = arguments[1];
  }

  encoding = encoding || 'utf8';
  commands = defaults.concat(commands);

  var child = ChildProcess.spawn("git", commands);
  var stdout = [], stderr = [];

  child.stdout.addListener('data', function (text) {
    stdout[stdout.length] = text;
  });

  child.stderr.addListener('data', function (text) {
    stderr[stderr.length] = text;
  });

  var exitCode;

  child.addListener('exit', function (code) {
    exitCode = code;
  });

  child.addListener('close', function () {
    if (exitCode > 0) {
      var err = new Error("git " + commands.join(" ") + "\n" + common.join(stderr, 'utf8'));
      if (gitENOENT.test(err.message)) {
        err.errno = process.ENOENT;
      }
      callback(err);
      return;
    }
    callback(null, common.join(stdout, encoding));
  });

  child.stdin.end();
}

