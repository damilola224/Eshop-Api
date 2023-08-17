const getTokenFromHeader = require('../helper/getTokenFromHeader');
const verifyToken = require('../helper/verifyToken');
const appErr = require('../helper/appErr');
const { User } = require('../model/User');

const isAdmin = async (req, res, next) => {
	//get token from header
	const token = getTokenFromHeader(req);
	//verify token
	const decordedUser = verifyToken(token);
	//save the user into req obj
	req.userAuth = decordedUser.id;

	//find the user
	const user = await User.findById(decordedUser.id);

	//Check admin

	if (user.isAdmin) {
		return next();
	} else {
		return next(appErr('Access Denied, Admin Onle', 403));
	}
};

module.exports = isAdmin;
