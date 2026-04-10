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
export const ROLE_HIERARCHY = {
    regular: 1,
    moderator: 5,
    admin: 10
};

export const requireRole = (minimumRequiredRole) => {
    return (req, res, next) => {
        // Ensure the user actually has a token payload (user_verify must run first)
        if (!req.user || !req.user.user_role) {
            return res.status(403).json({ message: "Forbidden: Role not found in token." });
        }

        const userLevel = ROLE_HIERARCHY[req.user.user_role] || 0;
        const requiredLevel = ROLE_HIERARCHY[minimumRequiredRole];

        // The Magic Check: Does their rank meet or exceed the required rank?
        if (userLevel >= requiredLevel) {
            next(); // They have the power! Let them through.
        } else {
            return res.status(403).json({
                message: `Forbidden: You need at least '${minimumRequiredRole}' privileges to do this.`
            });
        }
    };
};

export const isOneWeekOld = (request, response, next) => {
    const createdDate = new Date(request.user.created_date) || 0;
    const now = new Date();
    const diffMs = now - createdDate; // difference in milliseconds
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    if (ROLE_HIERARCHY[request.user.user_role] > 1) return next();
    if (~~diffMs < oneWeekMs) {
        return response.status(403).json({
            message: `Your account is NOT 1 week old. Please try again next time...`
        })
    } else {
        next();
    };
}
