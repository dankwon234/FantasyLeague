var Contest = require('../models/Contest.js');
var mongoose = require('mongoose');



this.handleGet = function(req, res, pkg){
	console.log('Contest CONTROLLER: Handle GET');
	
	// fetch specific Contest by ID:
	if (pkg.id != null){ 
		Contest.findById(pkg.id, function(err, contest){
			if (err){
				res.json({'confirmation':'fail', 'message':'Contest '+pkg.id+' not found'});
				return;
			}
			
			if (contest==null){
				res.json({'confirmation':'fail', 'message':'Contest '+pkg.id+' not found'});
				return;
			}
			
			res.json({'confirmation':'success', 'contest':contest.summary()});
		});
		return;
	}
	
	
	/* Query by filters passed into parameter string: */
	Contest.find(req.query, null, {sort: {timestamp: -1}}, function(err, contests) {
		console.log('FETCH Contests');
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		var response = {'confirmation':'success', 'contests':convertToJson(contests)};
	    var json = JSON.stringify(response, null, 2); // this makes the json 'pretty' by indenting it
		
		
	    res.setHeader('content-type', 'application/json');
	    res.send(json);
		return;
		
//		res.json({'confirmation':'success', 'contests':convertToJson(contests)});
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	console.log('Contest CONTROLLER: Handle POST');
	
	Contest.create(req.body, function(err, contest){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'contest':contest.summary()});
	});
}


// - - - - - - - - - - - - - - - - - - - - PUT HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

this.handlePut = function(req, res, pkg){
	
	var params = req.body;
	
	if ('action' in params){
		if (params.action == 'enter'){
			if (params.entries.length == 2){
				params['state'] = 'pending';
				params['activated'] = Date.now();
			}
		}
		
		delete params['action'];
	}
	
	Contest.findByIdAndUpdate(req.params.id, params, {new:true}, function(err, contest){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'contest':contest.summary()});
		return;
	});
}



// - - - - - - - - - - - - - - - - - - - - MISC - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


function convertToJson(contests){
	var results = new Array();
    for (var i=0; i<contests.length; i++){
  	  var p = contests[i];
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



