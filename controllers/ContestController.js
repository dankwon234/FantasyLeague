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
		
		var unexpired = new Array();
		var expired = new Array();
		var now = new Date();

		// temporarily removed for testing:

		// for (var i=0; i<contests.length; i++){
		// 	var contest = contests[i];
		// 	if (now >= contest.expires){  // contest expired
		// 		if (contest.participants.length < contest.minEntries) // not enough participants
		// 			expired.push(contest);
		// 		else
		// 			unexpired.push(contest);
		// 	}
		// 	else 
		// 		unexpired.push(contest);
		// }
		
		// temporary: remove after testing
		for (var i=0; i<contests.length; i++) {
			var contest = contests[i];
			unexpired.push(contest);
		}

		var response = {'confirmation':'success', 'contests':convertToJson(unexpired)};
	    var json = JSON.stringify(response, null, 2); // this makes the json 'pretty' by indenting it
		
	    res.setHeader('content-type', 'application/json');
	    res.send(json);
		
		// remove expired contests from backend:
		for (var i=0; i<expired.length; i++){
			var contest = contests[i];
			contest.remove();
		}
		
		return;
		
//		res.json({'confirmation':'success', 'contests':convertToJson(contests)});
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	console.log('Contest CONTROLLER - POST: '+JSON.stringify(req.body));
	
//	{"payouts":[9],"expires":"2015-08-20 22:54:23 +0000","minEntries":"10","title":"first contest","buyIn":"5","participants":["55be440aa3baa88d0ea459fe"],"group":"55c1888c1db957ba4cc95518","creator":"55be440aa3baa88d0ea459fe","state":"open","entries":[{"profile":"55be440aa3baa88d0ea459fe","lineup":["16815","16497","15150","16447","16144","SF"]}]}

	var expiration = new Date(req.body.expires);
	req.body['expires'] = expiration;
	
	
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



