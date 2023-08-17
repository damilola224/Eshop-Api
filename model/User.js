// mongoose schema
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
	},
	passwordHash: {
		type: String,
		default: '',
	},
	street: {
		type: String,
		default: '',
	},
	apartment: [
		{
			type: String,
		},
	],
	city: {
		type: String,
		default: '',
	},
	zip: {
		type: String,
		ref: '',
	},
	Country: {
		type: String,
		ref: '',
	},
	phone: {
		type: Number,
		default: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
});

userSchema.virtual('id').get(function () {
	return this._id.toHexString();
});
userSchema.set('toJSON', {
	virtuals: true,
});

// mongoose model
const User = mongoose.model('User', userSchema);

module.exports = {
	User,
};
