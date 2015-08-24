var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
	title: {type:String, trim:true, default:''},
	isPublic: {type:String, trim:true, default:''}, // yes or no
	admin: {type:String, default:''}, // creator of the group
	password: {type:String, default:''},
	image: {type:String, trim:true, default:''},
	profiles: {type:Array, default:[]},
	invited: {type:Array, default:[]},
	timestamp: {type:Date, default:Date.now},
	rosters: {type:mongoose.Schema.Types.Mixed, default:{}}, // {profileId:{'profile':{}, 'roster':[] }}
});

GroupSchema.methods.summary = function() {
	var summary = {
		'title':this.title, 
		'admin':this.admin, 
		'isPublic':this.isPublic, 
		'invited':this.invited, 
		'profiles':this.profiles, 
		'image':this.image, 
		'timestamp':this.timestamp, 
		'rosters':this.rosters, 
		'id':this._id
	};
	
	return summary;
};

module.exports = mongoose.model('GroupSchema', GroupSchema);