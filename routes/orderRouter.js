const express = require('express');
const { Order } = require('../model/Order');
const { OrderItem } = require('../model/Order-items');
const isLogin = require('../middlewares/isLogin');
const isAdmin = require('../middlewares/isLogin');
const router = express.Router();

// get method
router.get('/', isLogin, isAdmin, async (req, res) => {
	const orderList = await Order.find()
		.populate('user', 'name')
		.populate({
			path: 'orderItems',
			populate: { path: 'product', populate: 'order' },
		})
		.sort({ dateOrdered: -1 });
	if (!orderList) {
		res.status(500).json({ message: false });
	}
	res.send(orderList);
});

// get single order method
router.get('/:id', async (req, res) => {
	const orderList = await Order.find()
		.populate('user', 'name')
		.populate({
			path: 'orderItems',
			populate: { path: 'product', populate: 'order' },
		})
		.sort({ dateOrdered: -1 });
	if (!orderList) {
		res.status(500).json({ message: false });
	}
	res.send(orderList);
});

//get single order by single user
router.get('/get/singleOrder/:userid', isAdmin, isLogin, async (req, res) => {
	const userOrderList = await Order.find({ user: req.params.userid })
		.populate('user', 'name')
		.populate({
			path: 'orderItems',
			populate: { path: 'product', populate: 'order' },
		})
		.sort({ dateOrdered: -1 });
	if (!userOrderList) {
		res.status(500).json({ message: false });
	}
	res.send(userOrderList);
});

// post method
router.post('/', async (req, res) => {
	const {
		orderItems,
		shippingAddress1,
		shippingAddress2,
		city,
		country,
		zip,
		phone,
		status,
		totalPrice,
		user,
	} = req.body;
	const orderItemsIds = Promise.all(
		orderItems.map(async (orderItem) => {
			let newOrderItem = new OrderItem({
				quantity: orderItem.quantity,
				products: orderItem.product,
			});
			newOrderItem = await newOrderItem.save();
			return newOrderItem._id;
		})
	);
	const orderItemsIdResold = await orderItemsIds;

	const totalPrices = await Promise.all(
		orderItemsIdResold.map(async (orderItemId) => {
			const orderItem = await OrderItem.findById(orderItemId).populate(
				'product',
				'price'
			);
			const totalSum = orderItem.product.price * orderItem.quantity;
			return totalSum;
		})
	);
	const totalSum = totalPrices.reduce((a, b) => a + b, 0);
	let order = new Order({
		orderItems: orderItemsIdResold,
		shippingAddress1,
		shippingAddress2,
		city,
		country,
		zip,
		phone,
		status,
		totalPrice: totalSum,
		user,
	});
	order = await order.save();
	if (!order) {
		res.status(404).send('Order cannot send. ');
	}
	res.send(order);
});

// Update method

router.put('/:id', isLogin, isAdmin, async (req, res) => {
	const {
		orderItems,
		shippingAddress1,
		shippingAddress2,
		city,
		country,
		zip,
		phone,
		status,
		totalPrice,
		user,
	} = req.body;
	const orderList = await Order.findByIdAndUpdate(
		req.params.id,
		{
			orderItems,
			shippingAddress1,
			shippingAddress2,
			city,
			country,
			zip,
			phone,
			status,
			totalPrice,
			user,
		},
		{ new: true }
	);
	if (!orderList) {
		res.status(404).send('The order with this id is not found');
	}

	res.send(orderList);
});

//delete order
router.delete('/:id', isLogin, isAdmin, async (req, res) => {
	const order = await Order.findByIdAndRemove(req.params.id);
	if (!order) {
		res.status(404).send('The order with ID is not found');
	}
	res.send('Order deleted successfully');
});

// count order
router.get('/count/order', async (req, res) => {
	const orderCount = await Order.countDocuments();
	if (!orderCount) {
		res.status(500).json({ success: false });
	}
	res.send({
		orderCount: orderCount,
	});
});

module.exports = router;
