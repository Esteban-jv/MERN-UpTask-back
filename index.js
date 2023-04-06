import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prueba from './prueba.js';
import userRoutes from './routes/usuarioRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoute.js';

import connectDB from './config/db.js';

const app = express();
app.use(express.json());
dotenv.config()
connectDB();

//configurar cors
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function (origin, callback) {
        console.log(origin, whiteList)
        if(whiteList.includes(origin) || origin === undefined) {
            //accede a la API
            callback(null, true);
        } else {
            //denegar peticiones
            callback(new Error('Error de cors'));
        }
    }
}

app.use(cors(corsOptions));

//Routing
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    //console.log(`istening at ${PORT}.`);
});

// Socket.io
import { Server, Socket } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', (socket) => {
    //console.log("Conectado a socket.io");

    //definir eventos
    socket.on('open_project', (project_id) => {
        socket.join(project_id);

        //socket.emit('response',{name: 'Juan'})
    })

    socket.on('new_task', task => {
        socket.to(task.project).emit('task_added', task)
    })

    socket.on('delete_task', task => {
        socket.to(task.project).emit('task_deleted', task)
    })

    socket.on('edit_task', task => {
        socket.to(task.project._id).emit('task_updated', task)
    })

    socket.on('toggle_status', task => {
        socket.to(task.project._id).emit('new_status', task)
    })
})