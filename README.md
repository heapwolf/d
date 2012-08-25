deploytool
==========

# Abstract
A generic deploy tool for #node.js

# Features
- Uses git to manage versioning
- Binary differential deployments (only deploy your changes)
- An interactive REPL mode
- API agnostic
- Uses directory context (similar to npm)

## go into interactive mode (REPL)
`d`

## login or out from the api server of which you will push to
`d login`, `d logout`

## Push code from the local directory or a remote as a new or existing app
`d push [remote]`

## Push code from an existing app
`d pull`

## Push specific version of code from an existing app
`d pull <version>`

## Stop, Start or Restart an app
`d start`,
`d stop`,
`d restart`

## Get the status of a deployed app
`d info`

## View the package.json of a deployed app
`d view`

## List all deployed applications
`d list`

## Environment variables

### Set environment variable for an app
`d env <name> <value>`

### Get environment variables for an app
`d env`,

### Get a single environment variable from an app
`d env <name>`

### Clear an environment variable for an app
`d env <name> -c`

### Delete environment variable for an app
`d env <name> -d`

## Push server to use a particular version of an app (git version)
`d version <version>`

## Show logs for an app
`d logs`

## Display the current version (of push)
`d --version`

