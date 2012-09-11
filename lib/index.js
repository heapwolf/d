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
// prefer the first entry. If this host hangs up, 
// an attempt will be made for each subsequent entry 
// in the hosts array.
//
api.config = config.api;

//
// collect and export the commands so that they can be
// used programat
//
var pathname = __dirname + '/../lib/commands';

exports.commands = {
  raw: {},
  shortlist: [],
  longlist: {}
};

//
// get all of the commands from the commands directory,
// require them so they can be used with the REPL or via
// arguments that are provided from the command line.
//
fs.readdirSync(pathname).forEach(function (name) {

  //
  // get the code for each command and pull it in for use.
  //
  if (path.extname(name) === '.js') {

    var basename = path.basename(name, '.js');
    var rawfile = path.join(pathname, basename);

    exports.commands.raw[basename] = require(rawfile);
  }
});

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
  //log(loglevel, 'Attempting `git ' + args.join(' ') + '`');

  //
  // execute the actual git command.
  //
  var cp = spawn('git', args, { cwd: process.cwd() });
  var stdout = [], stderr = [], exitcode;

  cp.stdout.on('data', function (data) {
    //console.log(String(data));
    stdout.push(data);
  });

  cp.stderr.on('data', function (data) {
    //console.log(String(data));
    stderr.push(data);
  });

  cp.on('exit', function (code) {
    //console.log(code);
    exitcode = code;
  });

  cp.on('close', function (code) {

    //
    // advance to the next host and try again.
    //
    var oldhost = api.config.hosts[api.config.index];

    //
    // if the command sees it fit to try again, we
    // allow it to contue by passing the next function.
    //
    var next = function next() {

      ++api.config.index;
      oldhost.responsive = false;

      if(api.config.hosts[api.config.index]) {

        common.updateConfig();

        var newhost = api.config.hosts[api.config.index];

        //
        // at this point we should rewrite the config file
        // because we have tried to access a host and failed.
        //
        log(0, 'Attempting an alternative connection to `' + 
            newhost.address + '` on port `' + newhost.port + '`');
        
        //
        // replace any ip addresses in the arguments and try again.
        //
        for(var j = 0, jl = args.length; j < jl; j++) {

          args[j] = args[j].replace(common.matches.IPv4and6, function(s, protocol) {
            return protocol + newhost.address + ':' + newhost.port; 
          });
        }
        git.exec(args, opts, callback);
      }
      else {

        //
        // tell the user we tried all of the hosts, they are probably
        // offline, its highly unlikely that all of your servers are down.
        //
        log(2, 'No hosts could be contacted, is your internet connected?');

        //
        // reset the hosts index in case the user wants to try again later.
        // we should write this to the configuration file.
        //
        api.config.index = 0;
        common.updateConfig();

      }
    };

    if (code === 0) {
      oldhost.responsive = true;
    }

    callback(common.join(stderr), common.join(stdout), next);

  });

};

//
// if the current directory has a package.json file and it
// is not initialized as a git repo, we can initialize it
// and add a default remote to it.
//
git.startup = function setup(callback) {

  fs.stat(process.cwd() + '/package.json', function(err, stat) {

    if (!err) {

      fs.stat(process.cwd() + '/.git', function(err, stat) {

        if (err) {
          
          //
          // initalize the current directory as a git repository.
          //
          git.exec(['init'], {}, function(err, data) {

            if (err) {
              return callback(err);
            }
            git.addRemote(callback);

          });
        }
        else {

          callback(null, stat);
        }
      });
    }
    else {

      callback(null, stat);
    }
  });
};

//
// add a remote to the current repo, if one is not specified it will be
// formulated based on the information from the package.json and git config.
//
git.addRemote = function addRemote(remote, callback) {

  remote = remote || git.formulateRemote();
  var args = ['remote', 'add', 'origin-' + api.config.index, remote + '.git'];

  //
  // add a remote to the current directory.
  //
  git.exec(args, {}, function(err, data) {

    if (err) {
      return callback(err);
    }

    return callback(null, data);
  });
}

//
// get the config information from git and turn it into a JSON object.
//
git.repoInfo = function readConfig(callback) {

  var args = ['config', '-l'];

  git.exec(args, { loglevel: -2, encoding: 'utf8' }, function(err, data) {

    if (err) {
      return callback(err);
    }

    data = data.split('\n');

    var line, lineParts;
    var config = {};
    var parentPart = config;

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
      parentPart = config; 
    }

    return callback(null, config);

  });
};

//
// formulate the origin for the repo based on current settings and
// information that we know about the user and their package.json.
//
git.formulateRemote = function formulateRemote(config) {

  //
  // first get the root for the deploy, then get the username and the
  // name of the project so that we can form a destination. If the
  // username can not be found, use the user's email address.
  //
  var host = api.config.hosts[api.config.index];
  var root = host.protocol.toLowerCase() + 
        '://' + host.address + ':' + host.port;
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

    log(1, 'You have not set up your git user information!');

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

function softwareUpdate(callback) {

  var now = new Date(Date.now());
  var lastrun = new Date(config.lastrun);
  var threshold = lastrun.setMinutes(now.getMinutes + 5);

  config.lastrun = now.toString();
  common.updateConfig();

  //
  // if the user runs the command again within in 5 minutes
  // of the last time they ran it, dont bother checking for
  // a software update as this request may take several seconds.
  //
  if (threshold < now) {

    //
    // Check the GitHub tags to see if the current version 
    // of our software is outdated. If it is outdated then
    // install the latest.
    //
    request(
      {
        uri: config.update.url,
        timeout: 400
      }, 
      function (err, res, body) {

        try {
          var pkg = JSON.parse(body);

          if (semver.gt(pkg.version, pkg.version)) {
            
            log(1, 'A newer version of this program is available. try `npm install d`.');
            callback(true);
          } 
          else {

            callback(null);
          }
        }
        catch (ex) {
        
          //
          // Ignore errors from GitHub. We will notify the user
          // of an upgrade at the next possible opportunity.
          //
          callback(ex);
        }
      }
    );
  }
};

