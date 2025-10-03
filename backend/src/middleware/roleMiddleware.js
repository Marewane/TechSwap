// middleware/roleMiddleware.js : Middleware to check user roles for access control.
const requireRole = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Forbidden: insufficient rights" });
        }
        next();
    };
};

module.exports = requireRole;
