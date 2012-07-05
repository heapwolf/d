push
====

# Abstract
A generic deployment tool for #node.js

# Features
- Uses git to manage versioning
- Binary differential deployments (only deploy your changes)
- An interactive REPL mode
- API agnostic
- Uses directory context similar to npm (less typing)

## go into interactive mode (REPL)
`push`

## login or out from the api server of which you will push to
`push login`, 
`push logout`

## Push code as a new or existing app
`push up`

## Push remote code as a new or existing app
`push remote`

## Set the remote for a push (a git url)
`push remote <name>`

## Stop, Start or Restart an app
`push start`,
`push stop`, 
`push restart`

## List all deployed applications 
`push -a`

## Set environment variable for an app
`push -e <name> <value>`

## Get environment variable(s) for an app
`push -e`,
`push -e <name>`

## Clear an environment variable for an app
`push -e <name> -c`

## Delete environment variable for an app
`push -e <name> -d`

## Get all the info for an app
`push -i`

## Push server to use a particular version of an app (git version)
`push version <version>`

## Show logs for an app
`push -l`

## Display the current version (of push)
`push --version`


