//
// this file contains most of the implementation 
// that the binary will use, from the REPL or commandline.
//
var common = require('./common');
var path = require('path');
var fs = require('fs');
var config = require('../config/config.json');
var pkg = require('../package.json');
var spawn = require('child_process').spawn;
var colors = require('colors');

var log = common.log;

//
// an object to namespace the api members and methods.
//
var api = exports.api = {};

//
// find and extract ip v4 and v6 addresses inside of urls.
//


//
// prefer the first entry. If this host hangs up, 
// an attempt will be made for each subsequent entry 
// in the hosts array.
//
api.hosts = config.hosts;
api.host = 0;
api.root = config.hosts[api.host];
api.protocol = 'HTTP';

//
// an object to namespace the git members and methods.
//
var git = exports.git = {};

var dir, commands, defaults, workTree; 

var ERRORS = {

  HTTP: /HTTP request failed/,
  ENOENT: /fatal: (Path '([^']+)' does not exist in '([0-9a-f]{40})'|ambiguous argument '([^']+)': unknown revision or path not in the working tree.)/
};


try {

  //
  // Check is this is a working repo
  //
  dir = path.join(repo, '.git');
  fs.statSync(dir);
  workTree = __dirname;
  defaults = ['--git-dir=' + dir, '--work-tree=' + workTree];
}
catch (e) {

  dir = __dirname;
  defaults = ['--git-dir=' + dir];
}

//
// execute a git command, optionally specify the
// encoding. last callback should be a callback.
//
git.exec = function(args, opts, callback) {

  var encoding = opts.encoding || 'utf8';
  var loglevel = opts.loglevel || 0;

  //
  // tell the user what we are doing with git.
  //
  log(loglevel, 'attempting `git ' + args.join(' ') + '`');

  //
  // execute the actual git command.
  //

  var cp = spawn('git', args, { cwd: process.cwd() });
  var stdout = [], stderr = [], exitcode;

  cp.stdout.on('data', function (data) {
    //console.log(String(data).green);
    stdout.push(data);
  });

  cp.stderr.on('data', function (data) {
    //console.log(String(data).red);
    stderr.push(data);
  });

  cp.on('exit', function (code) {
    exitcode = code;
  });

  cp.on('close', function (code) {
    


    if (exitcode > 0 && stderr.length > 0) {

      function Err(message) {

        this.name = "Git";
        this.message = common.join(stderr, 'utf8');
      }

      Err.prototype = new Error();
      Err.prototype.constructor = Err;

      if (ERRORS.ENOENT.test(Err.message)) {
        Err.errno = process.ENOENT;
      }

      //
      // advance to the next host and try again.
      //
      log(1, '`' + api.hosts[api.host].join(':') + '` is unresponsive.');

      ++api.host;

      if(api.hosts[api.host]) {

        log(0, 'attempting an alternative connection to `' + api.hosts[api.host].join(':') + '`');

        var host = api.hosts[api.host].join(':');

        //
        // replace any ip addresses in the arguments and try again.
        //
        for(var j = 0, jl = args.length; j < jl; j++) {

          args[j] = args[j].replace(common.matches.IPv4and6, function(s, protocol) {
            return protocol + host;
          });
        }
        git.exec(args, opts, callback);
      }
      else {

        //
        // tell the user we tried all of the hosts, they are probably
        // offline, its highly unlikely that all of your servers are down.
        //
        log(2, 'no hosts could be contacted, is your internet connected?');

        //
        // return program control to the user.
        //
        callback(Err);
      }

    }
    else {
      
      callback(null, common.join(stdout) || common.join(stderr));
    }
  });

};

//
// a utility to initalize the current directory as a 
// github repo if it is not already one.
//
git.init = function setup(callback) {

  //
  // test if this is actually a git repo before we
  // bother getting the git configuration for it.
  //
  fs.stat(process.env['PWD'] + '/.git', function(err, stat) {
    
    if (err) {

      //
      // initalize the current directory as a git repository.
      //
      git.exec(['init'], {}, function(err, data) {

        if (err) {
          return callback(err);
        }

        var root = api.root;
        var repo = pkg.name;
        var args = ['remote', 'add', 'origin', root + '/' + repo + '.git'];
        
        //
        // add a remote to the current directory.
        //
        git.exec(args, {}, function(err, data) {

          if (err) {
            return callback(err);
          }

          return callback(null, data);
        });

      });
    }
    else {

      callback(null, stat);
    }
  });
};

//
// get the config information from git and turn it into a JSON object.
//
git.repoInfo = function readConfig(callback) {

  var args = ['config', '-l'];

  git.exec(args, { loglevel: -2, encoding: 'uft8' }, function(err, data) {

    if (err) {
      return callback(err);
    }

    data = data.split('\n');

    var line, lineParts;
    var cfg = {};
    var parentPart = cfg;

    for (var i = 0, il = data.length; i < il; i++) {

      if (data[i].indexOf('=') < 0) {
        continue;
      }

      line = data[i].split('=');
      lineParts = line[0].split('.');

      for (var j = 0, jl = lineParts.length; j < jl; j++) {
        if (!parentPart[lineParts[j]]) {
          parentPart[lineParts[j]] = (j === jl-1) ? line[1] : {};
        }
        parentPart = parentPart[lineParts[j]];
      }
      parentPart = cfg;
    }

    return callback(null, cfg);

  });
};

//
// formulate the origin for the repo based on current settings and
// information that we know about the user and their package.json.
//
git.formulateOrigin = function formOrigin(config) {

  //
  // first get the root for the deploy, then get the username and the
  // name of the project so that we can form a destination. If the
  // username can not be found, use the user's email address.
  //
  var root = api.protocol.toLowerCase() + '://' + api.root.join(':');
  var user = config.github && config.github.user;
  var path = [user || config.user.email, pkg.name].join('/');

  return [root, path].join('/');
};

//
// find an appropriate name and id for the user who is trying
// to use the deployment tool. this should come from git config.
//
git.getUserIdentity = function getUserIdentity(config) {

  //
  // if the user can not be identified, use the name
  // from their computer, concat it with their IP and 
  // give them a warning.
  //
  if (!(config.github && config.github.user) ||
    !(config.user && config.user.email)) {
    
    var ip = common.externalAddress();

    config.user.email = [process.env['USER'], ip].join('@');

    log(1, 'you have not set up your git user information!');

    return {

      name: process.env['USER'],
      id: config.user.email
    };
  }
  else {

    //
    // prefer the real name + github id, fallback to the
    // users email address specified in the user object.
    //
    return {

      name: config.user && config.user.name,
      id: config.github && config.github.user  
    };
  }
};
