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


this.invite = function(req, res, pkg) {
	var groupId = req.body.group;
	var invited = req.body.invited;
	
	Group.findById(groupId, function(err, group){
		if (err){
			res.json({'confirmation':'fail', 'message':'Group '+groupId+' not found'});
			return;
		}
		
		if (group==null){
			res.json({'confirmation':'fail', 'message':'Group '+groupId+' not found'});
			return;
		}
		
		var inv = group.invited;
		for (var i=0; i<invited.length; i++)
			inv.push(invited[i]);
		
		group['invited'] = inv;
		group.save(function(err, group){
			if (err){
				res.json({'confirmation':'fail', 'message':err.message});
				return;
			}
			
			res.json({'confirmation':'success', 'group':group.summary()});
			return;
		});

		// res.json({'confirmation':'success', 'group':group.summary()});
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



