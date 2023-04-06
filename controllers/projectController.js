import Project from '../models/Project.js'
import Task from '../models/Task.js';
import User from '../models/Usuario.js';

const getProjects = async (req, res) => {
    const projects = await Project
                            .find({
                                '$or':[
                                    { 'collaborators': { $in: req.usuario} },
                                    { 'creator': { $in: req.usuario} },
                                ]
                            })
                            .select('-tasks')

    res.json(projects);
};

const getProject = async (req, res) => {
    const { id } = req.params;

    //checar si existe
    const project = await Project
                        .findById(id)
                        .populate({ path: 'tasks', populate: {
                                path: 'completed',
                                select: "name email"
                                }
                            }
                        )
                        .populate('collaborators',"name email");
    if(!project) {
        const error = new Error("No encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() === req.usuario.id.toString() || project.collaborators.some(
        collaborator => collaborator._id.toString() === req.usuario._id.toString()
    ))
    {
        //const tasks = await Task.find().where('project').equals(id);

        return res.json(project);
    }
    else {
        const error = new Error("Acción no válida");
        return res.status(401).json({ msg: error.message });
    }

};

const newProject = async (req, res) => {
    const project = new Project(req.body);
    project.creator = req.usuario._id;

    try {
        const storedProject = await project.save();
        res.json(storedProject);
    } catch (error) {
        console.error(error)
    }
};

const editProject = async (req, res) => {
    const { id } = req.params;

    //checar si existe
    const project = await Project.findById(id);
    if(!project) {
        const error = new Error("No encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() === req.usuario.id.toString())
    {
        project.name = req.body.name || project.name;
        project.description = req.body.description || project.description;
        project.dueDate = req.body.due_date || project.dueDate;
        project.client = req.body.client || project.client;

        try {
            const storedProject = await project.save();
            return res.json(storedProject);
        } catch (error) {
            console.error(error);
        }
    }
    else {
        const error = new Error("Acción no válida");
        return res.status(401).json({ msg: error.message });
    }
};

const deleteProject = async (req, res) => {
    const { id } = req.params;

    //checar si existe
    const project = await Project.findById(id);
    if(!project) {
        const error = new Error("No encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() === req.usuario.id.toString())
    {
        try {
            await project.deleteOne();
            return res.json({"msg": "Proyecto eliminado"});
        } catch (error) {
            console.error(error);
        }
    }
    else {
        const error = new Error("Acción no válida");
        return res.status(401).json({ msg: error.message });
    }
};

const searchCollaborator = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v');
    //delete user._id
    
    if(!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({msg: error.message});
    }
    return res.json(user);
};

const addCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    //checar si existe
    if(!project) {
        const error = new Error("No encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() != req.usuario.id.toString())
    {
        const error = new Error("Acción no válida");
        return res.status(400).json({ msg: error.message });
    }

    //logic
    const { email } = req.body;

    const user = await User.findOne({email}).select('-confirmed -createdAt -password -token -updatedAt -__v');
    //delete user._id
    
    if(!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({msg: error.message});
    }
    // Verificar que no sea el creador
    if(project.creator.toString() === user.id.toString())
    {
        const error = new Error("El creador del proyecto ya es colaborador");
        return res.status(400).json({ msg: error.message });
    }
    // Verificar que no haya sido ya agregado
    if(project.collaborators.includes(user.id)) {
        const error = new Error("Colaborador ya agregado anteriormente");
        return res.status(400).json({ msg: error.message });
    }

    // Agregar colaborador
    project.collaborators.push(user.id);
    await project.save();
    return res.status(200).json({ msg: "Colaborador agregado exitosamente" });
};

const deleteCollaborator = async (req, res) => {
    const project = await Project.findById(req.params.id);

    //checar si existe
    if(!project) {
        const error = new Error("No encontrado");
        return res.status(404).json({ msg: error.message });
    }

    if(project.creator.toString() != req.usuario.id.toString())
    {
        const error = new Error("Acción no válida");
        return res.status(400).json({ msg: error.message });
    }

    // Se puede eliminar
    project.collaborators.pull(req.body.id);

    await project.save();
    return res.status(200).json({ msg: "Colaborador eliminado exitosamente" });
};

const getTasks = async (req, res) => {
    const { id } = req.params;

    const projectExists = await Project.findById(id);
    if(!projectExists) {
        const error = new Error("No encontrado");
        return res.status(404).json({msg: error.message});
    }

    const tasks = await Task.find().where('project').equals(id);

    return res.json(tasks);
};

export {
    getProjects,
    newProject,
    getProject,
    editProject,
    deleteProject,

    searchCollaborator,
    addCollaborator,
    deleteCollaborator,

    getTasks
};