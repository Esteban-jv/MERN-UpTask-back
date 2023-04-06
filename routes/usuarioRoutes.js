import express from "express";

const router = express.Router();

import { createUser, autenticar, confirm, requirePassword, comprobarToken, changePassword, perfil } from '../controllers/userController.js'
import checkAuth from '../middleware/checkAuth.js'

// Creación, autenticación y confirmación de usuarios
//router.get('/', users);
router.post('/', createUser);
router.post('/login', autenticar);
router.get('/confirm/:token',confirm)
router.post('/forgot-password',requirePassword);
router.route('/forgot-password/:token')
    .get(comprobarToken)
    .post(changePassword);

//las demás rutas protegidas
router.get('/profile', checkAuth, perfil);

export default router;