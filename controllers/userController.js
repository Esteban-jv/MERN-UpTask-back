import User from '../models/Usuario.js'
import generarId from '../helpers/general.js';
import genJWT from '../helpers/generarJWT.js';
import { emailRegister, emailForgotPassword } from '../helpers/emails.js';

const users = (req, res) => {
    // TODO
    /*res.json(
        {
            msg: "Desde API/USUARIOS"
        }
    )*/
};

const createUser = async (req, res) => {
    // Checar correos
    const { email } = req.body;
    const existeUsuario = await User.findOne({email});
    if (existeUsuario) 
    {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({
            msg: error.message
        })
    }
    try {
        const user = new User(req.body);
        user.token = generarId();
        const userStored = await user.save();

        //begin enviar email de confirmación
        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token
        });
        //end enviar email de confirmación
        return res.json(userStored)
    } catch (error) {
        return res.json(error)
    }
};

const autenticar = async (req, res) => {

    const { email, password } = req.body;
    //Comprobar que el usuario existe

    const usuario = await User.findOne({email});
    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }

    //Comprobar que el usuario está confirmado
    if(!usuario.confirmed) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({ msg: error.message });
    }

    //Comprobar password
    if(await usuario.checkPassowrd(password))
    {
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: genJWT(usuario._id)
        })
    }
    else
    {
        const error = new Error("Contraseña incorrecta");
        return res.status(403).json({ msg: error.message });
    }
};

const confirm = async (req, res) => {
    const { token } = req.params;
    const usuarioConfirmar = await User.findOne({token})
    //console.log(token, usuarioConfirmar)

    if(!usuarioConfirmar) {
        const error = new Error("Token no válido");
        return res.status(403).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.confirmed = true;
        usuarioConfirmar.token = null
        await usuarioConfirmar.save();
        res.json({ msg: "Usuario confirmado correctamente" });
    } catch (error) {
        return res.status(400).json({ msg: "Something went wrong" });
    }
};

const requirePassword = async (req, res) => {
    const { email } = req.body;
    //Comprobar que el usuario existe

    const user = await User.findOne({email});
    if(!user) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }

    try {
        user.token = generarId();
        await user.save();

        //enviar email
        emailForgotPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })
        res.json({ msg: "Hemos enviado un email con las instrucciones" })
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;
    //Comprobar que el usuario existe

    const usuario = await User.findOne({token});
    if(!usuario) {
        const error = new Error("El token no existe");
        return res.status(404).json({ msg: error.message });
    }
    else {
        //TODO
        res.json({ msg: "Token válido" })
    }
};

const changePassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    //Comprobar que el usuario existe

    const usuario = await User.findOne({token});
    if(!usuario) {
        const error = new Error("El token no existe");
        return res.status(404).json({ msg: error.message });
    }
    else {
        try {
            usuario.password = password;
            usuario.token = null;
            await usuario.save();
            res.json({ msg: "Se cambió la contraseña correctamente" });
        } catch (error) {
            return res.status(400).json({ msg: error.message });
        }
    }
};

const perfil = async (req, res) => {
    const { usuario } = req;
    return res.json({msg:`Bienvenido ${usuario.name}`, user: usuario})
};

export { users, createUser, autenticar, confirm, requirePassword, comprobarToken, changePassword, perfil };