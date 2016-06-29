# Tim's TDF 2016 dashboard
Tim's TDF 2016 dashboard
This dashboard is an anually recurring project that is developed about one month before the Tour De France (the most epic cycling event of the year). Every time I try to find some sort of live data feed, hack it, morph it, and use it in my own way. 

It mainly prevents me from watching television at work all day. Instead I have the live dashboard running on my second screen and enjoy its browser notifications.

The project evolves every year and tries to use bleeding edge technology. I don't care about your browser as this project is all about experimentation.

## Features
This year the project has the following features:
* Isomorpic architecture with nodejs, shared templating and JavaScript.
* The dashboard has an open connection with Websockets for live data streaming of tweets and progress updates of the current stage, groups or attackers, leaderboards and virtual ranking. No ajax calls are made from the front-end.
* ES6 code in the front-end and back-end.
* Promises are used for all the things.
* Complex fullscreen dashboard like layout for all devices with flexbox. 
* Native browser notifications for tweets and changes in groups of attacking riders
* Fullscreen mode for big screens like televisions and projectors.

## Query Parameters:
| Param | Meaning | Example | options |
|------------|-------------------------------------------------|-----------|------------------------------------|
| stage | Used for debug to see data for a specific stage. | 1100 | All stage names before the current |
| stream | Show twitter or livenews. | livenews | twitter, livenews |
| twitter_id | Which account to follow during stages. | 153403071 | Any valid twitter id. |

## Todo:
* Time trial progress tracking
* Show a virtual leaderboard for mountain stages
* Use node-schedule for automatic view switching

## Run it yourself
* Install Foreman globally
* Create a .env file in the root of the project and add your credentials there.

```
NODE_ENV=development
consumer_key=''
consumer_secret=''
access_token_key=''
access_token_secret=''
```

With the above in place run:
```
npm i
npm start
```
