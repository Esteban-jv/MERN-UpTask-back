import Project from '../models/Project.js';
import Task from '../models/Task.js';

const addTask = async (req, res) => {
    const { project } = req.body;

    const projectExists = await Project.findById(project)
    
    if(!projectExists) {
        const error = new Error('El proyecto no existe');
        return res.status(404).json({'msg':error.message})
    }

    if(projectExists.creator.toString() !== req.usuario._id.toString()) {
        const error = new Error('No tienes los permisos para este proyecto')
        return res.status(301).json({'msg':error.message});
    }

    try {
        const storedTask = await Task.create(req.body);

        // Store ID Project
        projectExists.tasks.push(storedTask._id);
        await projectExists.save();
        
        return res.json(storedTask);
    } catch (error) {
        console.error(error)
    }

};

const getTask = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');
    
    if(!task) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message})
    }

    if(task.project.creator.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(403).json({msg: error.message})
    }

    return res.json(task);
};

const updateTask = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');
    
    if(!task) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message})
    }

    if(task.project.creator.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(403).json({msg: error.message})
    }

    task.name = req.body.name || task.name;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.due_date = req.body.due_date || task.due_date;

    try {
        const storedTask = await task.save();
        return res.json(storedTask);
    } catch (error) {
        console.log(error);       
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');
    
    if(!task) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message})
    }

    if(task.project.creator.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(403).json({msg: error.message})
    }

    try {
        const project = await Project.findById(task.project)
        project.tasks.pull(task._id);
        
        // Inician en paralelo
        await Promise.allSettled([
            await project.save(),
            await task.deleteOne()
        ]);

        return res.json({"msg": "Tarea eliminada"});
    } catch (error) {
        console.error(error);
    }
};

const changeStatusTask = async (req, res) => {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');
    const project = task.project;

    if(!task) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message})
    }
    //console.log(req.usuario._id.toString(), project.collaborators);

    if(project.creator.toString() !== req.usuario.id.toString() && !project.collaborators.some(
        collaborator => collaborator._id.toString() === req.usuario._id.toString()
    )) {
        const error = new Error("Acción no válida");
        return res.status(403).json({msg: error.message})
    }

    try {
        task.status = !task.status;
        task.completed = req.usuario._id;
        await task.save();

        const storedTask = await Task.findById(id)
                                    .populate('project')
                                    .populate('completed')
        return res.json(storedTask);
    } catch (error) {
        console.error(error);
    }
};

export {
    addTask,
    getTask,
    updateTask,
    deleteTask,
    changeStatusTask
}