
var fs = require('fs');
var config = require('../config/config.json');

//
// join buffers based on their encoding.
//
exports.join = function join(arr, encoding) {

  var result, index = 0, length;

  encoding = encoding || 'utf8';

  length = arr.reduce(function(l, b) {
    return l + b.length;
  }, 0);

  result = new Buffer(length);

  arr.forEach(function(b) {
    b.copy(result, index);
    index += b.length;
  });

  if (encoding === 'utf8') {
    return result.toString(encoding);
  }
  return result;
}

var matches = {
  IPv4and6: /(http(?:s)?:\/\/)([^\/]*)/,
  special: /(?:`(.*?)`)?/g 
};

exports.matches = matches;

//
// get the external address of the machine on which the
// process is running.
//
exports.externalAddress = function externalAddress () {

  var interfaces = os.networkInterfaces();
  var IPv4, IPv6;

  interfaces && Object.keys(interfaces).forEach(function(i) {

    //
    // The first available physical interface is preferred,
    // if one is not accessible than we will attempt to get
    // the first virtual/logical interface that is available.
    // 
    // Tested on Mac OSX, Fedora 15, Ubuntu 11.04
    //
    //
    // ent0
    // The notation ent0 is used to specify the hardware 
    // adapter. It has nothing to do with the TCP/IP address.
    //
    // en0 represents the interface associated with hardware 
    // adapter ent0. The notation en0 is used for Standard 
    // Ethernet(inet). The TCP/IP address is associated with this 
    // interface.
    //
    // et0 represents the interface associated with hardware 
    // adapter ent0. The notation et0 is used for IEEE 802.3 
    // Ethernet(inet). If you are using standard ethernet 
    // protocol then it will not have TCP/IP address.
    //
    // on linux the eqv on ent, en and et seems to be eth
    // the trailing integer generally represents the known 
    // interfaces. 
    //
    if (i[0] === 'e') {
      interfaces[i].forEach(function(ifconfig) {
        if (ifconfig.internal === false) {
          if (ifconfig.family === 'IPv4') {
            IPv4 = ifconfig.address;
          }
          if (ifconfig.family === 'IPv6') {
            IPv6 = ifconfig.address;
          }
        }
      });
    }

  });
  return IPv4 || IPv6 || '127.0.0.1';
};

exports.log = function log() {

  var args = Array.prototype.slice.call(arguments);
  var level = parseInt(args.splice(0, 1), 10);
  var argv = require('optimist').argv;

  var color = 'white';
  var prefix = 'info';

  if (level === -1) {
    return console.log.apply(null, args);
  }

  if (level === -2 || argv.quiet) {
    return false;
  }

  if (level === 1) {
    color = 'yellow';
    prefix = 'warn';
  }

  if (level === 2) {
    color = 'red';
    prefix = 'err';
  }

  args = args.join(' ').replace(matches.special, function(s) {
    return s.blue;
  });

  args = prefix[color] + ': ' + args;

  return process.stdout.write('\r\n' + args);
};

exports.updateConfig = function updateConfig() {

  fs.writeFileSync(__dirname + '/../config/config.json', JSON.stringify(config, true, 2));
  exports.log(0, 'Updated the local configuration file for this project');
};

exports.updatePackage = function updatePackage() {

  //
  // don't try to find the package, this seems like it would be a nice
  // thing to do for the user, but it will lead to confusing rules about
  // what the user can and can not do in a directory. operations that are 
  // specific to a project should be done at the root of the project, 
  // similar to the way git works.
  //
  exports.hasPackage(function(err) {
    
    if (err) {

      log(2, 'The package.json was not updated\r\n');
    }
    else {

      fs.writeFileSync(process.cwd() + '/../config.json', JSON.stringify(config, true, 2));
      exports.log(0, 'Updated the package.json file for this project');
    }
  });
};

exports.hasPackage = function hasPackage(callback) {

  try {

    var package = require(process.cwd() + '/package.json');
    
    if (callback) {
      callback(null, package);
    }
  }
  catch(ex) {

    exports.log(1, 'No package.json file found in this directory\r\n');
    
    if (callback) {
      callback(ex);
    }
  }
};

