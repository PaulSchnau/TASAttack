var request = require('request');
var cheerio = require('cheerio');
var Run = require('../models/Run');

stars = 'http://tasvideos.org/Movies-Stars.html';
moons = 'http://tasvideos.org/Movies-Moons.html';

function scrapeTASVideos(url, tier){

    request(url, function(error, response, html){
        var $ = cheerio.load(html);
        var tier;

        $('table.item').each(function(){
            var table = $(this);

            var combinedText = table.find('th').text();
            var system = combinedText.substring(0, combinedText.indexOf(" "));
            var game = combinedText.substring(combinedText.indexOf(system)+system.length+1, combinedText.indexOf("(")-1);
            var version = combinedText.substring(combinedText.indexOf("(")+1, combinedText.indexOf(")"));
            var endingString = combinedText.substring(combinedText.indexOf(")")+1, combinedText.length);
            var timeFormatted = endingString.substring(endingString.lastIndexOf(" in ")+4, endingString.indexOf("by") - 1).trim();

            var catagory = ''; 
            if (endingString.indexOf('"') > 0) {
                var catagory = endingString.substring(endingString.indexOf('"')+1, endingString.indexOf(" in ") - 1);
            }

            if (timeFormatted.split(':').length == 2){
                var time = Date.parse('Thu, 01 Jan 1970 0:' + timeFormatted + ' GMT-0000'); 
            } else {
                var time = Date.parse('Thu, 01 Jan 1970 ' + timeFormatted + ' GMT-0000');
            }

            var runnersString = endingString.substring(endingString.lastIndexOf(" by ")+4, endingString.length-1); //-1 for period
            var runners = runnersString.replace(" & ", ", ").split(", "); 
            var idString = table.find("a:contains('Submission')").attr('href');
            var id = idString.substring(1, idString.indexOf('.'));
            var youtubeURL = table.find("a:contains('youtube')").first().attr('href');
            var description = table.find(".blah").text();
            var tdText = table.find(":contains('length')").text();
            var indexOfLength = tdText.indexOf(' length: ');
            var textAfterLength = tdText.substring(tdText.indexOf(' length: '), tdText.length);

            var realTimeFormatted = textAfterLength.substring(9, textAfterLength.indexOf(')'));
            if (realTimeFormatted.split(':').length == 2){
                var realTime = Date.parse('Thu, 01 Jan 1970 0:' + realTimeFormatted + ' GMT-0000'); 
            } else {
                var realTime = Date.parse('Thu, 01 Jan 1970 ' + realTimeFormatted + ' GMT-0000');
            }

            var runData = {
                id: id,
                combinedText: combinedText,
                game: game,
                version: version,
                catagory: catagory,
                runners: runners,
                system: system,
                timeFormatted: timeFormatted,
                time: time,
                youtubeURL: youtubeURL,
                description: description,
                realTime: realTime
            };

            Run.findOne({ id: id }, function(err, runToUpdate) {
                if (!runToUpdate) {
                    var newRun = new Run(runData);
                    newRun.save();
                } else {
                    Run.update({ id: id }, runData);
                }
            });
        });
    });
}

scrapeTASVideos(stars, 'Stars');
scrapeTASVideos(moons, 'Moons');
















