var express = require('express');
var router = express.Router();
var Profile = require('../models/Profile');
var NFLPlayer = require('../models/NFLPlayer');
var profileController = require('../controllers/ProfileController.js');
var groupController = require('../controllers/GroupController.js');
var contestController = require('../controllers/ContestController.js');
var nflPlayerController = require('../controllers/NFLPlayerController.js');
var controllers = {'profile':profileController, 'group':groupController, 'contest':contestController, 'nflplayer':nflPlayerController};
var twilio = require('twilio');
var fs = require('fs');
var request = require('request');


/* GET home page. */
router.get('/:resource', function(req, res, next) {
	
	if (req.params.resource == 'stats'){
		
//		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/PlayerGameStatsByWeek/2014REG/5';
		var endpoint = 'http://api.nfldata.apiphany.com/nfl/v2/JSON/PlayerGameStatsByTeam/2014REG/5/NYG';
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
				
	  		    res.setHeader('content-type', 'application/json');
	  		    var json = JSON.stringify(info, null, 2); // this makes the json 'pretty' by indenting it
	  		    res.send(json);
			}
		});		
		
		return;
	}
	
	if (req.params.resource == 'week5'){
		fs.readFile('public/resources/2014week5.json', 'utf8', function (err, data) {
		  if (err) {
	  		res.send({'confirmation':'fail', 'message':err.message});
			return;
		  }
		  
		  res.setHeader('content-type', 'application/json');
		  
//		  var statsJson = JSON.parse(data); // this is an array
		  var json = JSON.stringify(data, null, 2); // this makes the json 'pretty' by indenting it
		  res.send(json);
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
