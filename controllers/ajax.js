var Poll = require('../models/Poll');
var Run = require('../models/Run');

exports.startup = function(req, res) {
    var responseObject;
    Poll.findOne().sort('-createdAt').populate('runs').populate('currentRun').exec(function(err, poll) {
        res.send(JSON.stringify(poll));
    });

};
