require("dotenv").config();

var action = process.argv[2];
var input = process.argv[3];
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var fs = require("fs");

function logAppend(entry){
    console.log(entry);
    fs.appendFileSync("log.txt", entry+"\n");
}

function getTweet(err, tweets, response) {
    if (err) {
        logAppend('Error occurred while retrieving tweet: ' + err);
        return;
    }
    fs.appendFileSync("log.txt", "Action: "+action+"\n", function(err) {
        if (err) {
            console.log('Error occurred while appending to file: ' + err);
            return;
        }
    });
    for (var i in tweets){
        logAppend("Created at: "+tweets[i].created_at);
        logAppend(tweets[i].text);
    }
}

function getSong(err, data) {
    if (err) {
        logAppend('Error occurred while retrieving song: ' + err);
        return;
    }
    fs.appendFileSync("log.txt", "Action: "+action+"\nInput: "+input+"\n", function(err) {
        if (err) {
            console.log('Error occurred while appending to file: ' + err);
            return
        }
    });
    logAppend("Artist: "+JSON.stringify(data.tracks.items[0].artists[0].name,null,2));
    logAppend("Song: "+JSON.stringify(data.tracks.items[0].name,null,2));
    logAppend("Spotify Link: "+JSON.stringify(data.tracks.items[0].external_urls.spotify,null,2));
    logAppend("Album: "+JSON.stringify(data.tracks.items[0].album.name,null,2));
}

function getMovie(err, response, body) {
    if (err) {
        logAppend('Error occurred while retrieving movie: ' + err);
        return;
    }
    if (response.statusCode === 200) {
        fs.appendFileSync("log.txt", "Action: "+action+"\nInput: "+input+"\n", function(err){
            if (err) {
                console.log('Error occurred while appending to file: ' + err);
                return
            }
        });
        var parsed = JSON.parse(body);
        logAppend("Title: "+parsed.Title);
        logAppend("Year: "+parsed.Year);
        logAppend("IMDB Rating: "+parsed.Ratings[0].Value);
        logAppend("Rotten Tomatoes Rating: "+parsed.Ratings[1].Value);
        logAppend("Country: "+parsed.Country);
        logAppend("Language: "+parsed.Language);
        logAppend("Plot: "+parsed.Plot);
        logAppend("Actors: "+parsed.Actors);
    }
}

logAppend(Date()+"__________");
if (action == "my-tweets"){
    var client = new Twitter(keys.twitter);
    var params = {screen_name: 'Nananan92174668'};
    client.get('statuses/user_timeline', params, getTweet);

} else if (action == "spotify-this-song"){
    if(!input){
        input = "The+Sign";
    }
    var spotify = new Spotify(keys.spotify);
    spotify.search({ type: 'track', query: input, limit: 5 }, getSong);

} else if (action == "movie-this"){
    if(!input){
        input = "Mr. Nobody";
    }
    var request = require("request");
    request("http://www.omdbapi.com/?t="+input+"&y=&plot=short&apikey=trilogy", getMovie);

} else if (action == "do-what-it-says"){
    fs.readFile("random.txt", "utf8", function(err, data){
        if (err) {
            return console.log(err);
        }
        dataArr = data.split(",");
        action = dataArr[0];
        input = dataArr[1];
        fs.appendFileSync("log.txt", "Action: do-what-it-says"+"\n", function(err) {
            if (err) {
              logAppend('Error occurred while appending to file: ' + err);
              return
            }
        });

        if (action == "my-tweets"){
            var client = new Twitter(keys.twitter);
            var params = {screen_name: 'Nananan92174668'};
            client.get('statuses/user_timeline', params, getTweet);
        
        } else if (action == "spotify-this-song"){
            if(!input){
                input = "The+Sign";
            }
            var spotify = new Spotify(keys.spotify);
            spotify.search({ type: 'track', query: input, limit: 5 }, getSong);
        
        } else if (action == "movie-this"){
            if(!input){
                input = "Mr. Nobody";
            }
            var request = require("request");
            request("http://www.omdbapi.com/?t="+input+"&y=&plot=short&apikey=trilogy", getMovie);
        
        } else {
            logAppend(action+" is an invalid command");
        }
    });

} else {
    logAppend(action+" is an invalid command");
}
