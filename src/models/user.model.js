const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'Please fill a valid email address']
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        match:[/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,'Password must contain at least one letter and one number'],
        select:false
    },systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{
    timestamps:true
})


userSchema.pre('save',async function(){
    if(!this.isModified('password')){
        return;
    }
    this.password = await bcrypt.hash(this.password,10);
})

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema);

module.exports = userModel;
