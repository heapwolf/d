# SYNOPSIS
An git based, infrastructure-agnostic deploy tool for #node.js


# DESIGN

### No single end point
A single API endpoint is a single point of failure. A deployment tool 
should maintain a cache of API endpoints that can be tried in the case of
connection failure.


### Differential deployments
Only the delta of the code should be deployed. This significantly
 improves user experience while reducing the footprint on the network.

### Always an interactive REPL


### Uses public key infrastructure/cryptography


### Binary differential deployments (only deploy your changes)


# Usage
The program is always run in interactive REPL mode.


## Interactive mode (REPL)


## Push code to the cloud
__**Commands**__ `push [tag]`,

__**Description**__ Attempt to push the code in the current project to the 
deployment target(s). You may optionally specify a remote for the code push.


## Pull code from the cloud
__**Commands**__ `pull [tag]`,

__**Description**__ Pull the latest code from for the app. If no version is 
specified it will pull the latest. If a version is specified, it can be either 
the sha1 hash for a particular commit or a git tag.


## Stop, Restart or Start code
__**Commands**__ `d start [version]`, `d stop [all]`, `d restart`

__**Description**__ Send the application a start, stop or restart signal. 
These commands are short hand for `d sig start`, `d sig stop` and `d sig 
restart`. 

 - To specify a version of your app to start, supply the git `sha1` hash 
 or `tag`.

 - To stop all of the apps that you have deployed, specify `all` in addition 
 to `stop`.


## Send an arbitrary signal to the running code
__**Commands**__ `d sig <signal>`, `sig <signal>`

__**Description**__ Send an arbitrary signal to an application.


## Environment variables
__**Commands**__ `env *[name]* *[value]*`, `env *[name]* *[value]*`

__**Description**__ Environment variables are settings that are applied to the
shell environment when a deployment is made. This command will get, set, clear
and delete environmental variables. 

 - To get all of the variables, omit `name` and `value` and all of the 
 currently set variables will be returned. If `--json` or `-j` is specified, 
 all of the results will be returned as raw `JSON` format.

 - To set a variable, supply both the `name` and the `value`. If a value 
 contains whitespace, remember to quote it.

 - To get a variable, supply only the `name` of the variable. This will print 
 only the name and value of that variable.

 - To clear an environment variable for an app, supply only the `name` of the 
 variable and specify `-c`. For example: `d env <name> -c`.

 - To delete environment variable for an app, supply only the `name` of the 
 variable and specify `-d`. For example: `d env <name> -d`.


## Logs

__**Commands**__ `tail [file]`

__**Description**__ Application logging comes in two flavors. When running 
this program in interactive mode, you will have real-time logs over tcp. When 
this program is not running in interactive mode, you will see only a historic 
view. This historic view is updated when possible and does not represent the 
most current activity of the application.

