
var path = require('path'),
    colors = require('colors');

var args = {
    version: {
      alias: 'v',
      description: 'print version and exit',
      string: true
    },
    localconf: {
      description: 'search for `.push` file in ./ and then parent directories',
      string: true
    },
    jitsuconf: {
      alias: 'j', 
      description: 'specify file to load configuration from',
      string: true
    },
    noanalyze: {
      description: 'skip require-analyzer: do not attempt to dynamically detect dependencies',
      boolean: true
    },
    colors: {
      description: '--no-colors will disable output coloring',
      default: true,
      boolean: true
    },
    release: {
      alias: 'r',
      description: 'specify release version number or semantic increment (build, patch, minor, major)',
      string: true
    },
    raw: {
      description: 'only output line-delimited raw JSON',
      boolean: true
    }
  };

var push = module.exports = {};

