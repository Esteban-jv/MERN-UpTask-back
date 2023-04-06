import jwt from 'jsonwebtoken';
import User from '../models/Usuario.js';

const checkAuth = async (req, res, next)=> {
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
    {
        try {
            const token = req.headers.authorization.split(" ")[1];
            console.log(token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = await User.findById(decoded.id)
                .select("-password -token -confirmed -createdAt -updatedAt -__v");
            //console.log(req.usuario);
            if(!req.usuario) {
                const error = new Error("No hay un usuario con ese token");
                return res.status(404).json({ msg: error.message });
            }
            else {
                return next();
            }
        } catch (error) {
            return res.status(404).json({ msg: "Error de sesión" });
        }
    }
    else {
        return res.status(401).json({ msg: "No existe token" });
    }
};

export default checkAuth;