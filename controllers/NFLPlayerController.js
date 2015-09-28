var NFLPlayer = require('../models/NFLPlayer.js');
var mongoose = require('mongoose');



this.handleGet = function(req, res, pkg){
	console.log('NFL PLAYER CONTROLLER: Handle GET');
	
	// fetch specific player by ID:
	if (pkg.id != null){ 
		NFLPlayer.findById(pkg.id, function(err, player){
			if (err){
				res.json({'confirmation':'fail', 'message':'NFLPlayer '+pkg.id+' not found'});
				return;
			}
			
			if (player==null){
				res.json({'confirmation':'fail', 'message':'NFLPlayer '+pkg.id+' not found'});
				return;
			}

			res.json({'confirmation':'success', 'nfl player':player.summary()});
		});
		return;
	}
	
	
	/* Query by filters passed into parameter string: */
	NFLPlayer.find(req.query, null, {sort: {value: -1}}, function(err, players) {
		console.log('FETCH NFLPlayers');
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		res.json({'confirmation':'success', 'players':convertToJson(players)});
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	console.log('NFLPlayer CONTROLLER: Handle POST');
	
	NFLPlayer.create(req.body, function(err, player){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'player':player.summary()});
	});
}


// - - - - - - - - - - - - - - - - - - - - PUT HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

this.handlePut = function(req, res, pkg){
	
	NFLPlayer.findByIdAndUpdate(req.params.id, req.body, {new:true}, function(err, player){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'player':player.summary()});
		return;
	});
}



// - - - - - - - - - - - - - - - - - - - - MISC - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



function convertToJson(players){
	var results = new Array();
    for (var i=0; i<players.length; i++){
  	  var p = players[i];
  	  results.push(p.summary());
    }
	
	return results;
}

function randomString(limit){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i <limit; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



