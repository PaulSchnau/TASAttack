##Before You Start
This was built upon [Hackathon Starter](https://github.com/sahat/hackathon-starter). You should review its structure. You will need a Mongo instance and place its connection information in config/secrets.js. If you want to use Twitch and Twitter apis, you will need to register and app with both of them.

##Models
There’s two main Models used by Mongoose: Poll and Game.
Games are scraped from tasvideos.org. Game creation is done by the gameScrape.js worker. You can initiate the scrape on startup by uncommenting the initiation of gameScrape.js in app.js.

Polls contain the data sent to the client. Poll creation is done by the election.js worker. Only one Poll is active at a time. Polls contain the currently playing run's information as well as the information for the three candidates.


##Front End
There are two views, Home and nochat. Home is the typical client experience and nochat is what the Twitch stream uses. 

Polls are sent to the client via websocket. We use [reconnecting-websocket](https://github.com/joewalnes/reconnecting-websocket) to maintain connections between updates. 

Angular takes in the data into $scope.currentPoll which is used in the views.


##Social Media
Twitch updates are handled directly through their api using the twitchPoster.js worker. Because game titles sometimes vary in punctuation and length, twitchPoster shortens the game's name until their api comes up with a result.

Twitter is posted via the twitterPoster.js worker. It uses [Twit](https://github.com/ttezel/twit) to post.

Both of these workers are used in election.js

