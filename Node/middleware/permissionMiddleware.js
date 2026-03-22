import { permissions } from "../utils/permissions.js";

const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        const userRole = req.user.role;

        const rolePermissions = permissions[userRole];

        if (!rolePermissions || !rolePermissions.includes(requiredPermission)) {
            return res.status(403).json({
                message: "Access denied. Permission required: " + requiredPermission,
            });
        }

        next();
    };
};

export default permissionMiddleware;
