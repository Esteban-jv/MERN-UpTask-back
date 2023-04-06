import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    dueDate: {
        type: Date,
        default: Date.now()
    },
    client: {
        type: String,
        trim: true,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tasks:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
        }
    ],
    collaborators:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        }
    ],
}, {
    timestamps: true,
}
);

// Duplicate the ID field.
projectSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
projectSchema.set('toJSON', {
    virtuals: true
});

const Porject = mongoose.model('Project', projectSchema);

export default Porject;