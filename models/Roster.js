var mongoose = require('mongoose');

var RosterSchema = new mongoose.Schema({
	profile: {type:String, trim:true, default:''},
	group: {type:String, trim:true, default:''},
	salaryCap: {type:Number, default:1000000}, // $1 million salary cap
	players: {type:Array, default:[]},
	timestamp: {type:Date, default:Date.now},
});


RosterSchema.methods.summary = function() {
	return {'profile':this.profile, 'group':this.group, 'salaryCap':this.salaryCap, 'players':this.players, 'timestamp':this.timestamp, 'id':this._id};
};


module.exports = mongoose.model('RosterSchema', RosterSchema);