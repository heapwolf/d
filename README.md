deploytool
==========

# Abstract
A generic deploy tool for #node.js

# Motivation
 - A platform as a service must distribute the concerns of connectivity. A deployment tool should cycle 
through a cache of connection options N times in case of failure. 
 - A deployment tool should communicate with a deployment proxy, not a core API. The deploy proxy should 
distribute the code it receives to the appropriate target machines.
 - Deployments should be transactional, meaning that if any one step during the process fails, nothing is
affected on the target machine.

# Features
- Uses git to manage deployment versioning
- Binary differential deployments (only deploy your changes)
- An interactive REPL mode
- API agnostic
- Uses directory context (similar to npm)
- Extremely readable plugin architecture

## go into interactive mode (REPL)
`d`

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

