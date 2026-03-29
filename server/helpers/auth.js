import jwt from 'jsonwebtoken';

// 1. The base Authenticator (Who are you?)
export const user_verify = (request, response, next) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        request.user = decodedToken;
        next();
    } catch (error) {
        return response.status(401).json({ message: "Invalid or expired token!" });
    }
};

// 2. The Hierarchical Authorizer (Are you allowed?)
const ROLE_HIERARCHY = {
    regular: 1,
    moderator: 2,
    admin: 3
};

export const requireRole = (minimumRequiredRole) => {
    return (req, res, next) => {
        // Ensure the user actually has a token payload (user_verify must run first)
        if (!req.user || !req.user.userRole) {
            return res.status(403).json({ message: "Forbidden: Role not found in token." });
        }

        const userLevel = ROLE_HIERARCHY[req.user.userRole] || 0;
        const requiredLevel = ROLE_HIERARCHY[minimumRequiredRole];

        // The Magic Check: Does their rank meet or exceed the required rank?
        if (userLevel >= requiredLevel) {
            next(); // They have the power! Let them through.
        } else {
            res.status(403).json({
                message: `Forbidden: You need at least '${minimumRequiredRole}' privileges to do this.`
            });
        }
    };
};
