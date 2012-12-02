# Synopsis
A generic deploy tool for #node.js

# Motivation
 - A single API endpoint is a single point of failure. A deployment tool 
 should maintain a cache of API endpoints that can be tried in the case of
 connection failure.
 - Only the delta of the code should be deployed. This significantly
 improves user experience while reducing the footprint on the network.

# Features

## For End Users
 - Interactive REPL mode
   - Real-time via a tcp connection
 - Uses public key infrastructure/cryptography
 - Uses git under the hood
   - Binary differential deployments (only deploy your changes)
   - No snapshot management, simply use git tags and hashses

## For Deployment Tool Developers
 - API endpoint agnostic (trivial to change)
 - Easy to utilize public key Infrastructure schema
 - Very simple plugin architecture
   - add commands, help and arbitrary logic easily
 - Uses git under the hood
   - Do anything that git does

# Dependencies
Git is taken as a dependency. Git is used by hundreds of thousands of 
people on a daily basis. It is well tested. With Node.js you're taking 
`libuv`, `openssl` and other dependencies. Git isn't any more significant.


# Usage



## Interactive mode (REPL)
__**Commands**__ `d`

__**Description**__ Running this program without any parameters will cause 
it to go into interactive mode, a mode similar to the Node.js REPL. Because 
the program will remain running, it is possible to establish long lived 
connections to the deployment targets; this allows for interactive debugging.



## Push code to the cloud
__**Commands**__ `d push [remote]`, `push`

__**Description**__ Attempt to push the code in the current project to the 
deployment target(s). You may optionally specify a remote for the code push.



## Pull code from the cloud
__**Commands**__ `d pull [sha1|tag]`, `pull [sha1|tag]`

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



## Digital Signing using Public Key Infrastructure (PKI)

__**Commands**__ `d sign [id] [key] [phrase]`, `sign [id] [key] 
[phrase]``

### Cryptographic Signing For End Users
__**Description**__ In order to deploy to a repo, the API endpoint must 
have a copy of your public key. To get a public key you must first create 
a private key using `openssl`.

```bash
 $openssl genrsa -out nodejitsu_rsa 1024
```

```bash
 $openssl rsa -in nodejitsu_rsa -pubout > nodejitsu_rsa.pub
```

After you have created a private key, you can then extract its public key. 
Upload the public key to your service provider (nodejitsu for instance). you
need to be cautious when copying the key that you do not change it. For 
example, try this on the `OS X`.

```bash
cat nodejitsu_rsa.pub | pbcopy
```

Once you have uploaded your public key, you can sign git repositories and
then deploy them! For instance you could create a signature, go to a project
and then add your signature to it.

```bash
$d sign default ~/.ssh/nodejitsu_rsa "tiny clouds"
$cd myProject
$d sign default
```

### Cryptographic Signing For Deployment Tool Developers
To understand how this would work on the receiving side, see this 
[example](https://github.com/hij1nx/d/blob/master/examples/server/server.js).



## Send an arbitrary signal to the running code
__**Commands**__ `d sig <signal>`, `sig <signal>`

__**Description**__ Send an arbitrary signal to an application.



## Get info for the deployed code
__**Commands**__ `d info [name][]`, `info [name][]`

__**Description**__ Get information such as the current status of the code, 
number of network resources it is using, uptime, etc.

 - To get the info for another project, specify the name of the project. For 
 example: `d info hello-world`.



## Catalog of all deployed code
__**Commands**__ `d cat`, `cat`

__**Description**__ Show a catalog of all of the applications that you have 
currently deployed.



## Environment variables
__**Commands**__ `d env *[name]* *[value]*`, `env *[name]* *[value]*`

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

__**Commands**__ `d logs`, `logs` 

__**Description**__ Application logging comes in two flavors. When running 
this program in interactive mode, you will have real-time logs over tcp. When 
this program is not running in interactive mode, you will see only a historic 
view. This historic view is updated when possible and does not represent the 
most current activity of the application.

