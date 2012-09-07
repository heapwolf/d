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
 - You're already taking `libuv` as a dependency, why not take `git`.

# Features
- Uses git to manage deployment versioning
- Binary differential deployments (only deploy your changes)
- An interactive REPL mode
- API endpoint agnostic
- Uses directory context (similar to npm)
- Extremely readable plugin architecture

## go into interactive mode (REPL)
`d`
Running this program without any parameters  

## Push code from the local directory or a remote as a new or existing app
`d push [remote]`

## Pull code from an existing app
`d pull`

## Pull specific version of code from an existing app
`d pull <version>`

## Stop, Restart or Start [optionally start a specific version (sha1 hash or tag)]
`d start [version] [all]`,
`d stop [all]`,
`d restart`

## Get info for the deployed app, status, number of drones, uptime, etc.
`d info`

## View the package.json of the deployed app
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

## Application logs

__**Commands**__
`d logs`, `logs` 

__**Description**__
Application logging comes in two flavors. When running this program in interactive mode, you will have real-time logs over tcp. When this program is not running in interactive mode, you will see only a historic view. This historic view is updated when possible and does not represent the most current activity of the application.

