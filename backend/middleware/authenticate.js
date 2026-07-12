const User = require("../model/userSchema");

const authenticate = async (req, res, next) => {

    try {

        const userId = req.body.userId || req.params.userId;

        if (!userId) {
            return res.status(401).json({
                status: 401,
                message: "User ID is required"
            });
        }

        const rootUser = await User.findById(userId);

        if (!rootUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();

    } catch (error) {

        res.status(500).json({
            status: 500,
            message: "Authentication Failed"
        });

    }

};

module.exports = authenticate;