import User from "../models/user.model.js";

export const authorizeRoles = (...roles) => {
  return async(req, res, next) => {
    try {
        const _User = await User.findById(req.userId);
        if (!roles.includes(_User.Role)) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: "Access denied" });   
    }
  };
};
