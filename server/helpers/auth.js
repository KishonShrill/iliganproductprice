import jwt from 'jsonwebtoken'

const user_verify = async (request, response, next) => {
    try {
        const token = request.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET || "RANDOM-TOKEN"
        );

        request.user = decodedToken;
        next();
    } catch (error) {
        response.status(401).json({ error: new Error("Invalid request!") });
    }
};
export default user_verify;
