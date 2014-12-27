var secrets = require('../config/secrets');
var request = require('request');
var twitchToken = secrets.twitch.token;

function getSuggestions(gameOnly){
    request('https://api.twitch.tv/kraken/search/games?type=suggest&q=' + gameOnly, function (error, response, body) {
        var results = JSON.parse(body);
        if (results['games'][0]) {
            gameName = results['games'][0]['name'];
            changeTwitchGame(gameName);
        } else getSuggestions(gameOnly.slice(0, -1));
    }); 
}

function changeTwitchGame(game){
    request.put('https://api.twitch.tv/kraken/channels/tasattack?&channel[game]=' + game +' &oauth_token=' + twitchToken, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var results = JSON.parse(body);
            console.log('Changed Twitch game to '+ results.game);
        } else {
            changeTwitchGame(game.slice(0,-1));
        } });
}

exports.postTwitchGame = function(gameName){
    getSuggestions(gameName);    
}