var mongoose = require('mongoose');

var WeeklySummary = new mongoose.Schema({
	week: {type:Number, default:0},
	season: {type:String, trim:true, default:'2015'},
	games: {type:mongoose.Schema.Types.Mixed, default:{}},
	stats: {type:mongoose.Schema.Types.Mixed, default:{}},
	timestamp: {type:Date, default:Date.now},
});

WeeklySummary.methods.summary = function() {
	var summary = {
		'id': this._id,
		'week': this.week,
		'games': this.games,
		'season': this.season,
		'timestamp': this.timestamp
//		'stats': this.stats // don't return stats - just use for scoring
	};
	
	return summary;
};

module.exports = mongoose.model('WeeklySummary', WeeklySummary);