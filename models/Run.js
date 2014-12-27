var mongoose = require('mongoose');

var runSchema = new mongoose.Schema({
    createdAt : { type : Date, default: Date.now },
    updatedAt : { type : Date, default: Date.now },
    
    id: String,
    combinedText: String,
    game: String,
    version: String,
    catagory: String,
    runners: [String],
    system: String,
    description: String,
    rating: String,
    timeFormatted: String,
    time: Number,
    realTime: Number,
    youtubeURL: String,
    publicationURL: String,
    discussionURL: String,
    tier: String,
    
    wins: [mongoose.Schema.Types.ObjectId],
    loses: [mongoose.Schema.Types.ObjectId]
    
});

//Get a random Run
runSchema.statics.random = function(callback) {
    this.count(function(err, count) {
        if (err) {
            return callback(err);
        }
        var rand = Math.floor(Math.random() * count);
        this.findOne().skip(rand).exec(callback);
    }.bind(this));
};

module.exports = mongoose.model('Run', runSchema);
