import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
/**
 * Hashear el password antes de guardar
 */
usersSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        // go to next middleware
        next();
    }
    const salt = await bcrypt.genSalt(10);
    /* this en este caso es la referencia a User */
    this.password = await bcrypt.hash(this.password, salt);
});

usersSchema.methods.checkPassowrd = async function (passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
}

// Duplicate the ID field.
usersSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
usersSchema.set('toJSON', {
    virtuals: true
});

const User = mongoose.model('User', usersSchema);
export default User;