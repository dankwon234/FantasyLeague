var mongoose = require('mongoose');

var NFLPlayerSchema = new mongoose.Schema({
	fullName: {type:String, trim:true, lowercase:true, default:''},
	firstName: {type:String, trim:true, lowercase:true, default:''},
	lastName: {type:String, trim:true, lowercase:true, default:''},
	position: {type:String, trim:true, lowercase:true, default:''},
	team: {type:String, trim:true, lowercase:true, default:''},
	fantasyPlayerKey: {type:String, trim:true, default:''},
	value: {type:Number, default:0},
	timestamp: {type:Date, default:Date.now},
});


NFLPlayerSchema.methods.summary = function() {
	return {'lastName':this.lastName, 'firstName':this.firstName, 'fullName':this.fullName, 'team':this.team, 'fantasyPlayerKey':this.fantasyPlayerKey, 'value':this.value, 'position':this.position, 'timestamp':this.timestamp, 'id':this._id};
};


module.exports = mongoose.model('NFLPlayerSchema', NFLPlayerSchema);