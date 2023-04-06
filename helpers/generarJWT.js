import jwt from 'jsonwebtoken';

const genJWT = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        //{ expiresIn: '8h' }
        { expiresIn: '8d' }
    )
};

export default genJWT;