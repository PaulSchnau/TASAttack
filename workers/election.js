var events = require('events');
var irc = require('twitch-irc');
var secrets = require('../config/secrets');
var Poll = require('../models/Poll');
var Run = require('../models/Run');
var twitterPoster = require('./twitterPoster');
var twitchPoster = require('./twitchPoster');

var currentPoll; //Contains all game data, sent to clients. 
var currentPollUnpopulated; //Contains only _id referenes. This is what gets saved in the database.
var newPollTimeout;
var eventEmitter = new events.EventEmitter();

function createPoll(currentRun){
    console.log('Creating new Poll');
    var newPoll = new Poll();
    newPoll.currentRun = currentRun;
    newPoll.endsAt = new Date(Date.now() + currentRun.realTime);
    newPoll.runs = [];
    //Needs to be rewritten using asynch
    Run.random(function(err, run) {
        newPoll.runs.push(run);
        Run.random(function(err, run) {
            newPoll.runs.push(run);
            Run.random(function(err, run) {
                newPoll.runs.push(run);
                newPoll.populate('runs currentRun', function(err, newPopulatedPoll){
                    currentPoll = newPoll;
                    currentPollUnpopulated = newPoll.save(); // This loses the populated fields (runs and currentRun)
                    newPollTimeout = setTimeout(function(){
                        endPoll()
                    }, newPoll.endsAt.getTime() - Date.now() - 2000);
                });
            });
        });
    });
}

function endPoll(){
    console.log('Ending Poll');
    var nextGameIndex = 0;
    for (i = 1; i < currentPoll.votesPerRun.length; i++) {
        if(currentPoll.votesPerRun[i] > currentPoll.votesPerRun[nextGameIndex]){
            nextGameIndex = i;
        }
    }
    currentPoll.winner = currentPoll.runs[nextGameIndex]._id;
    currentPoll.populate('winner', function(err, newPopulatedPoll){
        createPoll(newPopulatedPoll.winner);
        twitterString = (newPopulatedPoll.winner.game + ' ' + newPopulatedPoll.winner.catagory + ' in ' + newPopulatedPoll.winner.timeFormatted + ' by ' + newPopulatedPoll.winner.runners.join(', ') + ' tasattack.com twitch.tv/tasattack').replace(/ +(?= )/g,'');
        twitterPoster.post('statuses/update', { status: twitterString}, function(err, data, response) {
        });
        twitchPoster.postTwitchGame(newPopulatedPoll.winner.game);
    });
    currentPollUnpopulated = currentPoll;
    currentPollUnpopulated.save();  
}

//Get active active poll, else 
Poll.findOne({endsAt : { $gte : Date.now() }})
.sort('created')
.populate('runs')
.populate('currentRun')
.exec(function(err, oldPoll) {
    if (!oldPoll) {
        console.log('No current poll found, creating one');
        Run.random(function(err, run) {
            createPoll(run);
        });
    } else {
        console.log('Restroing Previous poll');
        currentPoll = oldPoll;
        newPollTimeout = setTimeout(function(){
            endPoll()
        }, currentPoll.endsAt.getTime() - Date.now());
    }
});

var client = new irc.client({
    options: {
        debug: true,
        debugIgnore: ['ping', 'chat', 'action'],
        logging: false,
        tc: 3
    },
    identity: {
        username: 'tasattack',
        password: 'oauth:' + secrets.twitch.token
    },
    channels: ['tasattack']
});
client.connect();
client.addListener('chat', function (channel, userData, message) {

    var canditateNumber = parseInt(message);
    var userLower = userData.username.toLowerCase();
    var messageLower = message.toLowerCase();
    var isMod = (userData.special[0] == 'mod'); 

    if (canditateNumber <= 3 && canditateNumber > 0) {
        currentPoll.votes[userLower] = canditateNumber;
        currentPoll.markModified('votes');
        currentPoll.sumVotes();
        currentPollUnpopulated = currentPoll;
        currentPollUnpopulated.save();
        console.log(userLower + ' votes for '+ canditateNumber);

    } else if (messageLower == 'skip') {

        if (Date.now()+45000 > currentPoll.createdAt.getTime()){
            currentPoll.skips[userLower] = 1;
            currentPoll.markModified('skips');
            currentPoll.sumSkips();
            currentPollUnpopulated = currentPoll;
            currentPollUnpopulated.save();
            console.log(userLower + ' votes to skip');

            if (currentPoll.skipsTotal >= (currentPoll.votesTotal / 2) + 2 ){
                clearTimeout(newPollTimeout);
                endPoll();
            }
        }

    } else if (messageLower == 'unskip') {
        currentPoll.skips[userLower] = 0;
        currentPoll.markModified('skips');
        currentPoll.sumSkips();
        currentPollUnpopulated = currentPoll;
        currentPollUnpopulated.save();
        console.log(userLower + ' does not vote to skip');

    } else if (messageLower == 'modskip' && isMod){
        clearTimeout(newPollTimeout);
        endPoll();
    }


});

exports.currentPoll = function() {
    return currentPoll;
};



