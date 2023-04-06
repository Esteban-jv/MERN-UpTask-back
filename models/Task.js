import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    due_date: {
        type: Date,
        trim: true,
        default: Date.now(),
    },
    priority: {
        type: String,
        required: true,
        enum: ["Baja", "Media", "Alta"]
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    completed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
},{
    timestamps: true
});

// Duplicate the ID field.
taskSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
taskSchema.set('toJSON', {
    virtuals: true
});

const Task = mongoose.model("Task", taskSchema);
export default Task;