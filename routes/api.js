var express = require('express');
var router = express.Router();
var Profile = require('../models/Profile');
var NFLPlayer = require('../models/NFLPlayer');
var profileController = require('../controllers/ProfileController.js');
var groupController = require('../controllers/GroupController.js');
var contestController = require('../controllers/ContestController.js');
var nflPlayerController = require('../controllers/NFLPlayerController.js');
var weeklySummaryController = require('../controllers/WeeklySummaryController.js');
var twilio = require('twilio');
var fs = require('fs');
var request = require('request');
var Promise = require('bluebird');
var controllers = {
	'profile':profileController,
	'group':groupController,
	'contest':contestController,
	'nflplayer':nflPlayerController,
	'weeklysummary':weeklySummaryController
};


var WeeklySummary = require('../models/WeeklySummary.js');
var Contest = require('../models/Contest.js');
var Group = require('../models/Group.js');


var fetchWeeklySummaries = function(week){
	return new Promise(function (resolve, reject){
		
		WeeklySummary.find({'week':week}, null, {sort: {timestamp: -1}}, function(err, weeklysummaries) {
			if (err) { reject(err); }
			else { resolve(weeklysummaries); }
			
		});
	});
}


var fetchContestsForGroup = function(group){
	return new Promise(function (resolve, reject){
		
		Contest.find({'group':group}, null, {sort: {timestamp: -1}}, function(err, contests) {
			if (err) { reject(err); }
			else{ resolve(contests); }
		});
	});
}

var fetchGroup = function(groupId){
	return new Promise(function (resolve, reject){
		
		Group.findById(groupId, function(err, group){
			if (err) { reject(err); }
			else{ resolve(group); }
			
		});
	});
	
}

// this function inserts player results into the contest[results] key:
var updateContest = function(contest, stats, rosters){
	var entries = contest['entries']; // array of profile id numbers
	var results = {};
	var ranking = [];
	
	for (var i=0; i<entries.length; i++){
		var profileId = entries[i];
//		console.log('ENTRY: '+profileId);
		
		var roster = rosters[profileId];
		if (roster == null)
			continue;
		
		score = 0;
		var playerList = roster['roster']; // this is an array of player IDs
		for (var j=0; j<playerList.length; j++){
			var playerId = playerList[j];
			
//			console.log(j+'. PLAYER ID: '+playerId);
			var playerResult = stats[playerId];
			
			if (playerResult == null) { // player did not play that week
				console.log('PLAYER RESULT '+playerId+ ' NOT FOUND');
				continue;
			}
			
			playerResult['profile'] = profileId; // throw the owner's id in there to make scoring easier
//			console.log(JSON.stringify(playerResult));
			results[playerId] = playerResult;
			
			score += parseFloat(playerResult['score']);
		}
		
		var scoreCard = {};
		scoreCard['profile'] = profileId;
		scoreCard['score'] = score;
		ranking.push(scoreCard);
		
		ranking.sort(function(a, b) {
		    return parseFloat(b.score) - parseFloat(a.score);
		});
		
	}
	
	contest['ranking'] = ranking;
	contest['results'] = results;
	contest.save();
}


/* GET home page. */
router.get('/:resource', function(req, res, next) {
	
	/*
	if (req.params.resource == 'createstatus'){
		fs.readFile('public/resources/2015SchedulePRE.json', 'utf8', function (err, data) {
			if (err) {
				res.send({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			var schedule = JSON.parse(data); // this is an array
			
			var games = {};
			for (var i=0; i<schedule.length; i++){
				var game = schedule[i];
				if (game.Week != 1)
					continue;
				
				delete game["StadiumID"];
				delete game["StadiumDetails"];
				delete game["Channel"];
				games[game.GameKey] = game;
			}
			
			var statusSummary = {'games':games, 'week':1, 'isCurrent':'yes', 'season':'2015'};
			Status.create(statusSummary, function(err, status){
				if (err){
					res.json({'confirmation':'fail', 'message':err.message});
					return;
				}
		
			  	res.json({'confirmation':'success', 'status':status.summary()});
				return;
			});
		});
		
		return;
	}
	*/
	
	
	if (req.params.resource == 'score'){
		var week = req.query.week;
		if (week == null){
			res.json({'confirmation':'fail', 'message':'Missing week parameter.'});
			return;
		}
		
		var groupId = req.query.group;
		if (groupId == null){
			res.json({'confirmation':'fail', 'message':'Missing group parameter.'});
			return;
		}
		
		var all = {};
		
		fetchWeeklySummaries(week)
		.then(function(weeklysummaries){
			if (weeklysummaries.length == 0){
				res.json({'confirmation':'fail', 'message':'Weekly summary for week '+week+' not found.'});
				return;
			}
			
			all['weekly summary'] = weeklysummaries[0];
			return fetchContestsForGroup(groupId);
		})
		.then(function(contests){
			all['contests'] = contests;
			return fetchGroup(groupId);
		})
		.then(function(group){
			all['group'] = group;
			
			// process scores:
			var weeklysummary = all['weekly summary'];
			var rosters = group['rosters'];
			
			var contests = all['contests'];
			for (var i=0; i<contests.length; i++){
				var contest = contests[i];
				updateContest(contest, weeklysummary['stats'], rosters);
			}
			
			
			res.json({'confirmation':'success', 'all':all});
			return;
		})
		.catch(function(err){
			res.json({'confirmation':'fail','message':err.message});
			return;
		});
		
		
		return;
	}
	
	
	
	if (req.params.resource == 'stats'){
//		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/PlayerGameStatsByWeek/2014REG/4';
		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/PlayerGameStatsByWeek/2015PRE/0';
//		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/PlayerGameStatsByTeam/2014REG/5/NYG';
//		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/Schedules/2015REG';

 
		var options = {
		  url: endpoint,
		  headers: { 'Ocp-Apim-Subscription-Key': '4399b4154eba468985945039d762b59b' }
		};
 
		request(options, function callback(error, response, body) {
			if (error){
				console.log('ERROR: '+error.message);
				return;
			}
			
			if (response.statusCode == 200) {
				var info = JSON.parse(body);
	  		    var json = JSON.stringify(info, null, 2); // this makes the json 'pretty' by indenting it
				
	  		    res.setHeader('content-type', 'application/json');
	  		    res.send(json);
			}
		});		
		
		return;
	}
	
	
	
	/*
	// This creates all offensive position nfl players from a static file:
	if (req.params.resource == 'nflroster'){
		fs.readFile('public/resources/nflplayers.json', 'utf8', function (err, data) {
		  if (err) {
	  		res.send({'confirmation':'fail', 'message':err.message});
			return;
		  }
		  
		  res.setHeader('content-type', 'application/json');
		  var playersJson = JSON.parse(data); // this is an array
		  
		  var players = new Array();
		  for (var i=0; i<playersJson.length; i++){
			  var player = playersJson[i];
			  
			  var nflPlayer = new NFLPlayer();
			  nflPlayer['fullName'] = player.Name;
			  
			  var parts = player.Name.split(' ');
			  nflPlayer['firstName'] = parts[0];
			  nflPlayer['lastName'] = parts[parts.length-1];
			  
			  nflPlayer['fantasyPlayerKey'] = player.FantasyPlayerKey;
			  nflPlayer['position'] = player.Position;
			  nflPlayer['team'] = player.Team;
			  nflPlayer['value'] = 1000 * player.ProjectedFantasyPoints;
			  nflPlayer.save();
			  players.push(nflPlayer.summary());
		  }
		  
		  
		  var json = JSON.stringify(players, null, 2); // this makes the json 'pretty' by indenting it
		  res.send(json);
		});
		return;
	}
	*/
	
	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	controller.handleGet(req, res, {'id':null, 'parameters':req.query});
});


router.get('/:resource/:id', function(req, res, next) {
	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	controller.handleGet(req, res, {'id':req.params.id, 'parameters':req.query});
});


router.post('/:resource', function(req, res, next) {
	if (req.params.resource == 'login'){
		var controller = controllers['profile'];
		controller.handleLogin(req, res, null);
		return;
	}
	
	
	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	controller.handlePost(req, res, {'id':null, 'parameters':req.query});
});


router.put('/:resource/:id', function(req, res, next) {
	var controller = controllers[req.params.resource];
	if (controller == null){
		res.send({'confirmation':'fail', 'message':'Invalid Resource: '+req.params.resource});
		return;
	}
	
	if (req.params.id == null){
		res.send({'confirmation':'fail', 'message':'Missing resource identiifer.'});
		return;
	}
	
	controller.handlePut(req, res, {'id':req.params.id, 'parameters':req.query});
	
});





module.exports = router;
