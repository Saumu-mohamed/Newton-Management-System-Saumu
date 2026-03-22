import { roleHierarchy } from "../utils/roleHierachy.js";

const roleMiddleware = (actionRole) => {
    return (req, res, next) => {
        const userRolePower = roleHierarchy[req.user.role];
        const targetRolePower = roleHierarchy[actionRole];

        if (userRolePower < targetRolePower) {
            return res.status(403).json({
                message: "Access denied. Insufficient permissions.",
            });
        }

        next();
    };
};

export default roleMiddleware;