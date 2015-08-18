var mongoose = require('mongoose');

var ContestSchema = new mongoose.Schema({
	creator: {type:String, default:''}, // creator of the contest
	group: {type:String, default:''},
	season: {type:String, trim:true, default:'2015REG'}, 
	week: {type:String, trim:true, default:'1'},
	title: {type:String, trim:true, default:''},
	state: {type:String, trim:true, default:'open'}, // open, pending, or closed. peanding means games have started but not all are finished.
	entries: {type:Array, default:[]},
	participants: {type:Array, default:[]},
	minEntries: {type:Number, default:10}, // for now, all contests must have a minimum of 10 entries to activate
	buyIn: {type:Number, default:5},
	payouts: {type:Array, default:[9]},
	results: {type:mongoose.Schema.Types.Mixed, default:{}},
	ranking: {type:Array, default:[]}, // { profileId:score }
	activated: {type:Date, default:Date.now},
	timestamp: {type:Date, default:Date.now},
});

ContestSchema.methods.summary = function() {
	return {'results':this.results, 'participants':this.participants, 'activated':this.activated, 'week':this.week, 'season':this.season, 'ranking':this.ranking, 'creator':this.creator,'group':this.group, 'title':this.title, 'payouts':this.payouts, 'buyIn':this.buyIn, 'state':this.state, 'entries':this.entries, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('ContestSchema', ContestSchema);