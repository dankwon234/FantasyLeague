var WeeklySummary = require('../models/WeeklySummary.js');
var mongoose = require('mongoose');
var fs = require('fs');



this.handleGet = function(req, res, pkg){
	console.log('WeeklySummary CONTROLLER: Handle GET');
	
	// fetch specific WeeklySummary by ID:
	if (pkg.id != null){ 
		WeeklySummary.findById(pkg.id, function(err, weeklysummary){
			if (err){
				res.json({'confirmation':'fail', 'message':'weekly summary '+pkg.id+' not found'});
				return;
			}
			
			if (weeklysummary == null){
				res.json({'confirmation':'fail', 'message':'WeeklySummary '+pkg.id+' not found'});
				return;
			}

			res.json({'confirmation':'success', 'weekly summary':weeklysummary.summary()});
		});
		return;
	}
	
	
	/* Query by filters passed into parameter string: */
	var params = req.query;
	var limit = params.limit;
	if (limit == null)
		limit = 0;
	
	delete params['limit'];
	
	WeeklySummary.find(params, null, {sort: {timestamp: -1}, limit:limit}, function(err, weeklysummaries) {
		console.log('FETCH WeeklySummary');
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		if (weeklysummaries.length == 0){ // doesn't exist. create
			var week = req.query.week;
			if (week == null){
				res.json({'error':'Missing week parameter.'});
				return;
			}
			
			fs.readFile('public/resources/2015SchedulePRE.json', 'utf8', function (err, data) {
				if (err) {
					res.send({'confirmation':'fail', 'message':err.message});
					return;
				}
				
				var schedule = JSON.parse(data); // this is an array
			
				var games = {};
				for (var i=0; i<schedule.length; i++){
					var game = schedule[i];
					if (game.Week != week)
						continue;
				
					delete game["StadiumID"];
					delete game["StadiumDetails"];
					delete game["Channel"];
					games[game.GameKey] = game;
				}
			
				var body = {'games':games, 'week':week, 'isCurrent':'yes', 'season':'2015PRE'};
				WeeklySummary.create(body, function(err, weeklysummary){
					if (err){
						res.json({'confirmation':'fail', 'message':err.message});
						return;
					}

				  	res.json({'confirmation':'success', 'weekly summary':weeklysummary.summary()});
					return;
				});
			});
			return;
		}
		
	    res.setHeader('content-type', 'application/json');
		var response = {'confirmation':'success', 'weekly summaries':convertToJson(weeklysummaries)};
		
	    var json = JSON.stringify(response, null, 2); // this makes the json 'pretty' by indenting it
	    res.send(json);
		return;
		
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	console.log('WeeklySummary CONTROLLER: Handle POST');
	
	WeeklySummary.create(req.body, function(err, weeklysummary){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'weekly summary':weeklysummary.summary()});
	});
}


// - - - - - - - - - - - - - - - - - - - - PUT HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

this.handlePut = function(req, res, pkg){
	
	WeeklySummary.findByIdAndUpdate(req.params.id, req.body, {new:true}, function(err, weeklysummary){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'weekly summary':weeklysummary.summary()});
		return;
	});
}



// - - - - - - - - - - - - - - - - - - - - MISC - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


function convertToJson(weeklysummaries){
	var results = new Array();
    for (var i=0; i<weeklysummaries.length; i++){
  	  var p = weeklysummaries[i];
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



