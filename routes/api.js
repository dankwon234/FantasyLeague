var express = require('express');
var router = express.Router();
var Profile = require('../models/Profile');
var NFLPlayer = require('../models/NFLPlayer');
var profileController = require('../controllers/ProfileController.js');
var groupController = require('../controllers/GroupController.js');
var rosterController = require('../controllers/RosterController.js');
var nflPlayerController = require('../controllers/NFLPlayerController.js');
var controllers = {'profile':profileController, 'group':groupController, 'roster':rosterController, 'nflplayer':nflPlayerController};
var twilio = require('twilio');
var fs = require('fs');


/* GET home page. */
router.get('/:resource', function(req, res, next) {
	
	var resource = req.params.resource;
	if (resource == 'nflroster'){
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
		  
		  
//		  var json = JSON.stringify(playersJson, null, 2);
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
