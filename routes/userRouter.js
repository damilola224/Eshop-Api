const express = require('express');
const { User } = require('../model/User');
const bcrypt = require('bcryptjs');
const generatetoken = require('../helper/generateToken');
const getTokenFromHeader = require('../helper/getTokenFromHeader');
const isLogin = require('../middlewares/isLogin');
const isAdmin = require('../middlewares/isAdmin');
const appErr = require('../helper/appErr');
const router = express.Router();

// get method
router.get('/', isLogin, isAdmin, async (req, res) => {
	const userList = await User.find();
	res.send(userList);
});

// post method : Register
router.post('/register', async (req, res, next) => {
	const {
		name,
		email,
		passwordHash,
		phone,
		street,
		apartment,
		zip,
		city,
		country,
	} = req.body;
	//check if the product already exists

	const userFound = await User.findOne({ name });
	if (userFound) {
		return next(appErr(`User ${name} already exists`, 400));
	}

	const salt = await bcrypt.genSalt(10);
	let user = new User({
		name,
		email,
		passwordHash: bcrypt.hashSync(passwordHash, salt),
		phone,
		street,
		apartment,
		zip,
		city,
		country,
	});
	user = await user.save();
	if (!user) {
		return next(appErr('user cannot send.', 404));
	}

	res.send(user);
});

// post method : Login
router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	const userFound = await User.findOne({ email });
	if (!userFound) {
		return res.status(404).send('Invalid username or password provided.');
	}

	if (userFound && bcrypt.compareSync(password, userFound.passwordHash)) {
		res.status(200).json({
			message: 'User login successful.',
			name: userFound.name,
			email: userFound.email,
			isAdmin: userFound.isAdmin,
			token: generatetoken(userFound._id),
		});
	} else {
		res.status(404).send('Invalid username or password provided.');
	}
});

// get single user

router.get('/:profile', isLogin, async (req, res) => {
	console.log(getTokenFromHeader(req));
	const userProfile = await User.findById(req.userAuth);
	res.send(userProfile);
});

//update user

router.put('/update', isLogin, async (req, res) => {
	const {
		name,
		email,
		passwordHash,
		phone,
		street,
		apartment,
		zip,
		city,
		country,
	} = req.body;

	//check if the email is already exist
	const userEmail = await User.findOne({ email });
	if (userEmail) {
		res.status(404).send(`${email} User already exist`);
	}
	const user = await User.findByIdAndUpdate(
		req.userAuth,
		{
			name,
			email,
			passwordHash,
			phone,
			street,
			apartment,
			zip,
			city,
			country,
		},
		{
			new: true,
		}
	);
	res.json({
		status: 'success',
		data: user,
	});
});

//delete user

router.delete('/:id', async (req, res) => {
	const userList = await User.findByIdAndRemove(req.params.id);
	if (!userList) {
		res.status(404).send('The user with ID is not found');
	}
	res.send('User deleted successfully');
});

module.exports = router;
