const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userCredentialSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minlength: [6, 'Minimum password length is 6 characters.']
    },
    typeofuser: {
        type: String,
        required: true,
        enum: {
            values: ["jobseeker", "employer"],
            message: 'Type of user is invalid.'
        }
    }
});

// Hashing of Passwords Prior to Creation in DB:
userCredentialSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Validation of User Credentials For Login:
userCredentialSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password)
        if (auth){
            return user;
        }
        throw Error('Incorrect password.')
    }
    throw Error('Incorrect email.')
};

const UserCredential = mongoose.model('UserCredential', userCredentialSchema);
module.exports = UserCredential;