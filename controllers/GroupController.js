var Group = require('../models/Group.js');
var mongoose = require('mongoose');



this.handleGet = function(req, res, pkg){
	console.log('Group CONTROLLER: Handle GET');
	
	// fetch specific group by ID:
	if (pkg.id != null){ 
		Group.findById(pkg.id, function(err, group){
			if (err){
				res.json({'confirmation':'fail', 'message':'Group '+pkg.id+' not found'});
				return;
			}
			
			if (group==null){
				res.json({'confirmation':'fail', 'message':'Group '+pkg.id+' not found'});
				return;
			}

			res.json({'confirmation':'success', 'group':group.summary()});
		});
		return;
	}
	
	
	/* Query by filters passed into parameter string: */
	Group.find(req.query, null, {sort: {timestamp: -1}}, function(err, groups) {
		console.log('FETCH Groups');
		if (err) {
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
		res.json({'confirmation':'success', 'groups':convertToJson(groups)});
	});
}


// - - - - - - - - - - - - - - - - - - - - POST HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



this.handlePost = function(req, res, pkg){
	Group.create(req.body, function(err, group){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'group':group.summary()});
	});
}


// - - - - - - - - - - - - - - - - - - - - PUT HANDLER - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

this.handlePut = function(req, res, pkg) {
	Group.findByIdAndUpdate(req.params.id, req.body, {new:true}, function(err, group){
		if (err){
			res.json({'confirmation':'fail', 'message':err.message});
			return;
		}
		
	  	res.json({'confirmation':'success', 'group':group.summary()});
		return;
	});
}

this.updateRoster = function(req, res, pkg) {
	if (!req.session){
		res.send({'confirmation':'fail', 'message':'User not logged in.'});
		return;
	}

	if (!req.session.user){
		res.send({'confirmation':'fail', 'message':'User not logged in.'});
		return;
	}
	
	var userId = req.session.user;
	var groupId = req.params.id;

	Group.findById(groupId, function(err, group){
		if (err){
			res.json({'confirmation':'fail', 'message':'Group '+groupId+' not found'});
			return;
		}
		
		if (group == null){
			res.json({'confirmation':'fail', 'message':'Group '+groupId+' not found'});
			return;
		}
		
		var roster = req.body.roster;
		group.rosters[userId] = roster;
		group.markModified('rosters'); // EXTREMELY IMPORTANT: In Mongoose, 'mixed' object properties don't save automatically - you have to mark them as modified:

		console.log('UPDATE ROSTER: '+JSON.stringify(group));
		
		group.save(function(err, group){
			if (err){
				res.json({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'group':group.summary()});
			return;
		});

	});
	return;

}

this.invite = function(req, res, pkg) {
	var groupId = req.body.group;
	
	Group.findById(groupId, function(err, group){
		if (err){
			res.json({'confirmation':'fail', 'message':'Group '+groupId+' not found'});
			return;
		}
		
		if (group == null){
			res.json({'confirmation':'fail', 'message':'Group '+groupId+' not found'});
			return;
		}
		
		var list = req.body.invited;
		var all = group.invited;
		for (var i=0; i<list.length; i++)
			all.push(list[i]);
		
		group['invited'] = all;
		
		group.save(function(err, group){
			if (err){
				res.json({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'group':group.summary()});
			return;
		});

	});
	return;
}



// - - - - - - - - - - - - - - - - - - - - MISC - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



function convertToJson(groups){
	var results = new Array();
    for (var i=0; i<groups.length; i++){
  	  var p = groups[i];
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



