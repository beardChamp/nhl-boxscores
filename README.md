# nhl-boxscores

Learning to build NHL boxscores with web components with as few libraries as possible and without any build processes.

## New NHL stats API
The scoreboard is updated to use the 2023 version of the NHL's public stats API. Some community based documentation on this and prior versions of the API can be found at [Drew Hynes' nhlapi repo](https://gitlab.com/dword4/nhlapi/-/blob/master/new-api.md).

## Getting it running

To run the scoreboard, you'll need to run two seperate processes. 

First, you'll need to run [local-cors-anywhere](https://github.com/dkaoster/local-cors-anywhere) to prevent CORS issues with the new NHL API. To support the secondary goal of limited libraries and build process, I like to run this using `npx local-cors-anywhere`. The default port is `8080` and the scoreboard uses this port. From there, I use [http-server](https://github.com/http-party/http-server) installed globally to serve the files. It's a great package to serve the contents of any directory. It's default port is also `8080`, so I call it using `http-server -p 8081`.