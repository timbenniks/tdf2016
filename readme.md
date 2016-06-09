# Tim's TDF 2016 dashboard
This TDF dashboard is an anually recurring project that starts about one month before the Tour De France (the most epic cycling event of the year). Every time I try to find some sort of live data feed, hack it, morph it and use it for my own dashboard.

The project evolves every year and tries to use bleeding edge technology. I don't care about your browser as this project is all about experimentation.

## Features
This year the project has the following features:
* Isomorpic architecture with node, shared templating and JavaScript.
* The dashboard has an open connection with Websockets for live data streaming of tweets and progress updates of the current stage, groups or attackers, leaderboards and virtual ranking. No ajax calls are made from the front-end.
* ES6 code in the front-end and back-end.
* Promises are user for all the things.
* Complex fullscreen dashboard like layout for all devices with flexbox. 
* Native browser notifications for tweets and changes in groups of attacking riders
* Fullscreen mode for big screens like televisions and projectors.

Todo:
* Time trial progress tracking
* Video embed (if I find a good / free one)
* A special screen for rest days
* Show a virtual leaderboard for mountain stages

## Run it yourself
Add your twitter credentials in /data/config.json

```
npm i
npm start
```