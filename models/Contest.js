var mongoose = require('mongoose');

var ContestSchema = new mongoose.Schema({
	creator: {type:String, default:''}, // creator of the contest
	group: {type:String, default:''},
	title: {type:String, trim:true, default:''},
	state: {type:String, trim:true, default:'open'}, // open, pending, or closed. peanding means games have started but not all are finished.
	categories: {type:Array, default:[]}, // array of statistical categories to use for scoring
	entries: {type:Array, default:[]},
	minEntries: {type:Number, default:10}, // for now, all contests must have a minimum of 10 entries to activate
	buyIn: {type:Number, default:5},
	payouts: {type:Array, default:[]},
	timestamp: {type:Date, default:Date.now},
});

ContestSchema.methods.summary = function() {
	return {'creator':this.creator,'group':this.group, 'title':this.title, 'payouts':this.payouts, 'buyIn':this.buyIn, 'state':this.state, 'categories':this.categories, 'entries':this.entries, 'minEntries':this.minEntries, 'timestamp':this.timestamp, 'id':this._id};
};

module.exports = mongoose.model('ContestSchema', ContestSchema);