var Profile = require('../models/Profile.js');
var mongoose = require('mongoose');
var twilio = require('twilio');



this.handleGet = function(req, res, pkg){
	console.log('PROFILE CONTROLLER: Handle GET');
	
	// fetch specific profile by ID:
	if (pkg.id != null){ 
		Profile.findById(pkg.id, function(err, profile){
			if (err){
				res.json({'confirmation':'fail', 'message':'Profile '+pkg.id+' not found'});
				return;
			}
			
			if (profile==null){
				res.json({'confirmation':'fail', 'message':'Profile '+pkg.id+' not found'});
				return;
			}

			res.json({'confirmation':'success', 'profile':profile.summary()});
		});
		return;
	}
	
	
	/* Query by filters passed into parameter string: */
	Profile.find(req.query, function(err, profiles) {
		console.log('FETCH PROFILES');
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		res.json({'confirmation':'success', 'profiles':convertToJson(profiles)});
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	console.log('PROFILE CONTROLLER: Handle POST');
	
	var profileParams = req.body;
	profileParams['pin'] = randomString(6);


	Profile.create(profileParams, function(err, profile){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'profile':profile.summary()});
	});
}


// - - - - - - - - - - - - - - - - - - - - PUT HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

this.handlePut = function(req, res, pkg){
	
	Profile.findByIdAndUpdate(req.params.id, req.body, {new:true}, function(err, profile){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		
		var sendPin = req.body.sendPin;
		if (sendPin == null){
		  	res.json({'confirmation':'success', 'profile':profile.summary()});
			return;
		}
		
		var accountSid = 'AC817c36f0cdb7e4d489c5e2586a149095';
		var authToken = "fd2430d88835fab8df742d83818eafbd";
		var client = require('twilio')(accountSid, authToken);
 
		client.messages.create({
		    body: "Your PIN code is "+req.body.pin,
		    to: '+1'+req.body.phone,
		    from: "+12013454820"
		}, function(err, message) {
		    process.stdout.write(message.sid);
		  	res.json({'confirmation':'success', 'profile':profile.summary()});
			return;
		});
	});
}


// - - - - - - - - - - - - - - - - - - - - LOGIN - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


this.handleLogin = function(req, res, pkg){
	
	Profile.find({'email':req.body.email}, function(err, profiles) {
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		if (profiles.length==0){
			res.json({'confirmation':'fail', 'message':'Profile '+req.body.email+' not found.'});
			return;
		}
		
		var profile = profiles[0]; // assume first one
		if (profile.password != req.body.password){
			res.json({'confirmation':'fail', 'message':'Incorrect Password'});
			return;
		}
	
	
		res.json({'confirmation':'success', 'profile':profile.summary()});
		return;
	});
}


// - - - - - - - - - - - - - - - - - - - - MISC - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



function convertToJson(profiles){
	var results = new Array();
    for (var i=0; i<profiles.length; i++){
  	  var p = profiles[i];
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



