const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt library, which is used for hashing passwords.

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        minlength:[3,'Name must be at least 3 characters']
    },
    email:{
        type:String,
        unique:true,
        required:[true,'Email is required'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email is invalid"]
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:[6,'Password must be at least 6 characters'],
        select:false, // hide by default when querying
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active",
    },
    avatar:{
        type:String,
        default:'https://i.pravatar.cc/150?img=4'
    },
    bio:{
        type:String,
        maxlength:[500,'bio cannot be longer than 500 characters'],
        default:''
    },
    skillsToLearn: {
        type: [String],       // array of strings
        default: [],          // empty array if no skills yet
    },
    skillsToTeach: {
        type: [String],
        default: [],
    },
    rating: {
        type:Number,
        min:0,
        max:5,
        default:0
    },
    totalSession: {
        type:Number,
        default:0 // starts at 0 for new users
    },
    lastLogin:{
        type:Date,
        default:null, // null until first login in
    }
},{timestamps:true});
//This is a Mongoose middleware that runs before saving a user to the database to securely hash the password.
// pre-save middleware (new users and .save() updates)
userSchema.pre('save', async function(next){

    //Checks if the password has been changed.
    //If the password is not modified, skip hashing (important so you don’t rehash an already hashed password when updating other fields).

        //
        if(!this.isModified('password')) return next(); // if they are no midification in  password just skip this middlware under 
        try{
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password,salt)
            next()

        }catch(err){
            next(err);
        }
})

// pre-findOneAndUpdate middleware (updates via findOneAndUpdate)
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password)
}

module.exports = mongoose.model('User',userSchema);