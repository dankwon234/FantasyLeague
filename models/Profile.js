var mongoose = require('mongoose');

var ProfileSchema = new mongoose.Schema({
	deviceToken:{type:String, trim:true, lowercase:true, default:''},
	firstName:{type:String, trim:true, lowercase:true, default:''},
	lastName:{type:String, trim:true, lowercase:true, default:''},
	email:{type:String, trim:true, lowercase:true, default:''},
	password:{type:String, default:''},
	pin:{type:String, trim:true, lowercase:true, default:''},
	username:{type:String, trim:true, default:''},
	phone:{type:String, trim:true,lowercase:true, default:''},
	image:{type:String, trim:true, default:''},
	timestamp:{type:Date, default:Date.now},
});

ProfileSchema.methods.summary = function() {
	return {'firstName':this.firstName, 'lastName':this.lastName, 'username':this.username, 'email':this.email, 'pin':this.pin, 'deviceToken':this.deviceToken, 'phone':this.phone, 'image':this.image, 'timestamp':this.timestamp, 'firstName':this.firstName, 'id':this._id};
};

module.exports = mongoose.model('ProfileSchema', ProfileSchema);