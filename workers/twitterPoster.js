var Twit = require('twit');
var secrets = require('../config/secrets');

var T = new Twit({
    consumer_key:         secrets.twitter.consumerKey
    , consumer_secret:      secrets.twitter.consumerSecret
    , access_token:         secrets.twitter.access_token
    , access_token_secret:  secrets.twitter.access_token_secret
});

module.exports = T;