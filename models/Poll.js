var mongoose = require('mongoose');
var Run = require('../models/Run');


var pollSchema = new mongoose.Schema({
    createdAt : { type : Date, default: Date.now },
    updatedAt : { type : Date, default: Date.now },
    endsAt : { type : Date, default: null },
    
    runs :  [{ type: mongoose.Schema.ObjectId, ref: 'Run' }],
    votes: { type : mongoose.Schema.Types.Mixed, default: {} },
    votesTotal: { type : Number, default: 0 },
    votesPerRun: { type : [Number], default: [0, 0, 0] },
    skips: { type : mongoose.Schema.Types.Mixed, default: {} },
    skipsTotal: { type : Number, default: 0 },
    winner: { type: mongoose.Schema.ObjectId, ref: 'Run' },
    currentRun : { type: mongoose.Schema.ObjectId, ref: 'Run' }
    
},{minimize: false});

//Get a random Run
pollSchema.methods.sumSkips = function() {
    this.skipsTotal = 0;
    for (var username in this.skips) {
        this.skipsTotal += this.skips[username]; //skips can have value 0 via unskip
    }
};

pollSchema.methods.sumVotes = function(){
    this.votesPerRun = [];
    this.votesTotal = 0;
    for (i = 0; i < 3; i++) { 
        this.votesPerRun.push(0);
    }
    for (var username in this.votes) {
        this.votesTotal += 1;
        this.votesPerRun[this.votes[username]-1]+=1;
    }
}

module.exports = mongoose.model('Poll', pollSchema);
