// mongoose schema
const mongoose = require('mongoose');

const order_itemSchema = mongoose.Schema({
	quantity: {
		type: Number,
		required: true,
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Product',
	},
});

// mongoose model
const OrderItem = mongoose.model('OrderItem', order_itemSchema);

module.exports = {
	OrderItem,
};
