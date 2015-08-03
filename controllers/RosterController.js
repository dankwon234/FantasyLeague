var Roster = require('../models/Roster.js');
var mongoose = require('mongoose');



this.handleGet = function(req, res, pkg){
	console.log('Roster CONTROLLER: Handle GET');
	
	// fetch specific roster by ID:
	if (pkg.id != null){ 
		Roster.findById(pkg.id, function(err, roster){
			if (err){
				res.json({'confirmation':'fail', 'message':'Roster '+pkg.id+' not found'});
				return;
			}
			
			if (roster==null){
				res.json({'confirmation':'fail', 'message':'Roster '+pkg.id+' not found'});
				return;
			}

			res.json({'confirmation':'success', 'roster':roster.summary()});
		});
		return;
	}
	
	
	/* Query by filters passed into parameter string: */
	Roster.find(req.query, null, {sort: {timestamp: -1}}, function(err, rosters) {
		console.log('FETCH Rosters');
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		res.json({'confirmation':'success', 'rosters':convertToJson(rosters)});
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	console.log('ROSTER CONTROLLER: Handle POST');
	
	Roster.create(req.body, function(err, roster){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'roster':roster.summary()});
	});
}


// - - - - - - - - - - - - - - - - - - - - PUT HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

this.handlePut = function(req, res, pkg){
	
	Roster.findByIdAndUpdate(req.params.id, req.body, {new:true}, function(err, roster){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'roster':roster.summary()});
		return;
	});
}



// - - - - - - - - - - - - - - - - - - - - MISC - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



function convertToJson(rosters){
	var results = new Array();
    for (var i=0; i<rosters.length; i++){
  	  var p = rosters[i];
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



