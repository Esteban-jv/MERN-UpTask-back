import nodemailer from "nodemailer";

export const emailRegister = async (data) => {
    const { email, name, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      //email info

      const info = await transport.sendMail({
        from: '"Uptask - Administrador de proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'Updask - COnfirmación de cuenta',
        text: "Comprueba tu cuenta en UpTask",
        html: `<p>Hola: <b>${name}</b> comprueba tu cuenta en UpTask</p>
        <p>Tu cuenta está casi lista, solo debes hacer click en el siguiente enlace para comprobarla</p>
        <br>
        <a href="${process.env.FRONTEND_URL}/confirm/${token}" >Confirmar cuenta</a>
        <br><br>
        <p>Si tu o creaste esta cuenta, puedes ingorar este mensaje</p>`
      })
};

export const emailForgotPassword = async (data) => {
  const { email, name, token } = data;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

    //email info

    const info = await transport.sendMail({
      from: '"Uptask - Administrador de proyectos" <cuentas@uptask.com>',
      to: email,
      subject: 'Updask - Reestablecer contraseña',
      text: "Reestablecer contraseña",
      html: `<p>Hola: <b>${name}</b> has solicitado reestablecer tu contraseña</p>
      <p>Para reestablecer contraseña da click en el siguiente enlace</p>
      <br>
      <a href="${process.env.FRONTEND_URL}/forgot-password/${token}" >Crear nueva contraseña</a>
      <br><br>
      <p>Si tu no solicitaste reestablecer tu contraseña puedes ignorar este mensaje</p>`
    })
}