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
var WeeklySummary = require('../models/WeeklySummary.js');
var Contest = require('../models/Contest.js');
var Group = require('../models/Group.js');
var controllers = {
	'profile':profileController,
	'group':groupController,
	'contest':contestController,
	'nflplayer':nflPlayerController,
	'weeklysummary':weeklySummaryController
};




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
var updateContest = function(contest, stats){
	var entries = contest['entries']; // [{profile:123, lineup:[134132, 3213, 12555, etc]}]
	var results = {};
	
	for (var i=0; i<entries.length; i++){
		var entry = entries[i];
		var profileId = entry['profile'];
		
		var lineup = entry['lineup']; // this is an array of player IDs
		if (lineup == null)
			continue;
		
		score = 0;
		for (var j=0; j<lineup.length; j++){
			var playerId = lineup[j];
			
			var playerResult = stats[playerId];
			if (playerResult == null)  // player did not play that week
				continue;
			
			playerResult['profile'] = profileId; // throw the owner's id in there to make scoring easier
			results[playerId] = playerResult;
			score += parseFloat(playerResult['score']);
		}
		
		entry['score'] = score;
	}
	
	entries.sort(function(a, b) {
	    return parseFloat(b.score) - parseFloat(a.score);
	});
	
	contest['entries'] = entries;
	contest['results'] = results;
	contest.save();
}


/* GET home page. */
router.get('/:resource', function(req, res, next) {

	if (req.params.resource == 'currentuser'){ // check if current user is logged in
		var controller = controllers['profile'];
		controller.checkCurrentUser(req, res);
		return;
	}


	/* This runs through the results of played games and enters the stats into the weekly summary */
	if (req.params.resource == 'updateweeklysummary'){
		var week = req.query.week;
		if (week == null){
			res.json({'confirmation':'fail', 'message':'Missing week parameter.'});
			return;
		}
		
		fs.readFile('public/resources/2015week'+week+'.json', 'utf8', function (err, data) {
			if (err){
				res.json({'confirmation':'fail', 'message':err.message});
				return;
			}
			
		  	var statsJson = JSON.parse(data); // this is an array
			var scoringKey = {
				'KickReturnTouchdowns':6, 
				'PuntReturnTouchdowns':6, 
				'FumblesLost':-2, 
				'TwoPointConversionReceptions':2, 
				'TwoPointConversionRuns':2, 
				'TwoPointConversionPasses':2, 
				'FumbleReturnTouchdowns':6, 
				'ReceivingTouchdowns':6, 
				'ReceivingYards':0.1, 
				'PassingYards':0.04, 
				'RushingYards':0.1, 
				'PassingTouchdowns':4, 
				'PassingInterceptions':-2, 
				'RushingTouchdowns':6
			};

		  	var summary = {};
		  	var ignore = ['CustomD365FantasyPoints', 'FantasyPoints', 'Number', 'Week', 'PlayerID', 'SeasonType', 'Season', 'Activated', 'Played', 'Started', 'ShortName', 'PlayingSurface', 'Stadium', 'Temperature', 'Humidity', 'WindSpeed', 'FanDuelSalary', 'FantasyDataSalary', 'OffensiveSnapsPlayed', 'OffensiveTeamSnaps', 'DefensiveTeamSnaps', 'SpecialTeamsTeamSnaps', 'PassingRating', 'FantasyPointsPPR', 'ScoringDetails', 'PassingCompletionPercentage', 'PassingYardsPerAttempt', 'PassingYardsPerCompletion', 'RushingAttempts', 'RushingYardsPerAttempt', 'ReceivingTargets', 'ReceivingYardsPerReception', 'ReceptionPercentage', 'PassingLong', 'RushingLong'];
		  	for (var i=0; i<statsJson.length; i++){
					
				var playerStats = statsJson[i];
				if (playerStats['PositionCategory'] == 'DEF') // ignore defensive players
					continue;

				if (playerStats['Position'] == 'P') // ignore punters
					continue;

				var playerId = playerStats['PlayerID'].toString();
				var playerSummary = {};

				var stats = Object.keys(playerStats);
				var score = 0;
					
				for (var j=0; j<stats.length; j++) {
					var stat = stats[j];
					if (ignore.indexOf(stat) != -1)
						continue;

					var value = playerStats[stat];
					if (value == null)
						continue;

					if (value == 0) // only register what the player did
						continue;

					playerSummary[stat] = value;
					
					if (stat=='PassingYards')
						score += 0.04*value;

					if (stat=='RushingYards')
						score += 0.1*value;

					if (stat=='PassingTouchdowns')
						score += 4*value;

					if (stat=='PassingInterceptions')
						score += -2*value;

					if (stat=='RushingTouchdowns')
						score += 6*value;

					if (stat=='ReceivingYards')
						score += 0.1*value;

					if (stat=='ReceivingTouchdowns')
						score += 6*value;

					if (stat=='FumbleReturnTouchdowns')
						score += 6*value;

					if (stat=='TwoPointConversionPasses')
						score += 2*value;

					if (stat=='TwoPointConversionRuns')
						score += 2*value;

					if (stat=='TwoPointConversionReceptions')
						score += 2*value;

					if (stat=='FumblesLost')
						score += -2*value;

					if (stat=='PuntReturnTouchdowns')
						score += 6*value;

					if (stat=='KickReturnTouchdowns')
						score += 6*value;
					}

					playerSummary['score'] = score.toFixed(2);
					summary[playerId] = playerSummary;
				}
				
				
				WeeklySummary.find(req.query, null, {sort: {timestamp: -1}}, function(err, weeklysummaries) {
					console.log('FETCH WeeklySummary');
					if (err) {
						res.json({'confirmation':'fail', 'message':err.message});
						return;
					}
					
					if (weeklysummaries.length == 0)
						return;
					
					var weeksummary = weeklysummaries[0];
		  		  	weeksummary['stats'] = summary;
					
				  	res.json({'confirmation':'success', 'weekly summary':weeksummary.summary()});
					weeksummary.save();
					return;
				});
			});
		
		
		return;
	}
	
	
	
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
		.then(function(group){ // process scores:
			var weeklysummary = all['weekly summary'];
			
			var contests = all['contests'];
			for (var i=0; i<contests.length; i++){
				var contest = contests[i];
				updateContest(contest, weeklysummary['stats']);
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
		var week = req.query.week;
		if (week == null){
			res.json({'confirmation':'fail', 'message':'Missing week parameter.'});
			return;
		}
		
//		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/PlayerGameStatsByWeek/2015REG/'+week;
//		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/Schedules/2015REG';
		var endpoint = 'https://api.fantasydata.net/nfl/v2/JSON/GameStatsByWeek/2015REG/'+week;
 
		var options = {
			url: endpoint,
			headers: { 'Ocp-Apim-Subscription-Key': '73172b56e4b442e8a0bf91a472c82654' }
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
	
	
	if (req.params.resource == 'players'){
		var endpoint = 'https://api.fantasydata.net/nfl/v2/JSON/DailyFantasyPlayers/2015';

		var options = {
			url: endpoint,
			headers: { 'Ocp-Apim-Subscription-Key': '73172b56e4b442e8a0bf91a472c82654' }
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
			  
			  nflPlayer['fantasyPlayerKey'] = player.PlayerID;
			  nflPlayer['position'] = player.Position;
			  nflPlayer['team'] = player.Team;
			  nflPlayer['value'] = player.Salary;
//			  nflPlayer.save();
			  players.push(nflPlayer.summary());
		  }
		  
		  
		  var json = JSON.stringify(players, null, 2); // this makes the json 'pretty' by indenting it
		  res.send(json);
		});
		return;
	}


	
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
	var resource = req.params.resource;
	
	if (resource == 'invite'){
		groupController.invite(req, res, null);
		return;
	}

	if (resource == 'updateroster'){
		groupController.updateRoster(req, res, null);
		return;
	}
	
	var controller = controllers[resource];
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
