# nhl-boxscores

Learning to build NHL boxscores with web components with as few libraries as possible and without any build processes.

## New NHL stats API
The scoreboard is updated to use the 2023 version of the NHL's public stats API. Some community based documentation on this and prior versions of the API can be found at [Drew Hynes' nhlapi repo](https://gitlab.com/dword4/nhlapi/-/blob/master/new-api.md).

## Getting it running

To run the scoreboard, you'll need to run two seperate processes. 

First, you'll need to run [local-cors-anywhere](https://github.com/dkaoster/local-cors-anywhere) to prevent CORS issues with the new NHL API. To support the secondary goal of limited libraries and build process, I run this using `npx local-cors-anywhere`. The default port is `8080` and the app assumes use of this port. 

From there, I use [http-server](https://github.com/http-party/http-server) to serve the files. It's a great package to serve the contents of any directory. It's default port is also `8080`, so I use `npx http-server -p 8081`.

## Potential future updates
- The current date navigation isn't ideal for longer breaks (like between seasons or during the Olympic break).
- I'd like to update the date display and manipulation with the Javascript Temporal API to remove Day.js
- I'd love to have the period-breakdown component working again after the data was restructured.
