const mongoose=require('mongoose');
const connect=mongoose.connect('mongodb://localhost:27017/G-fluent')
//connection checking
connect.then(()=>{
    console.log("Database connection established");
})
.catch(()=>{
    console.log("Error connecting to database");
})

//Database schema

const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        
    },
    age:{
        type:Number,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        
    },
    password:{
        type:String,
        required:true
    }
})

const collection= new mongoose.model('users',userSchema)

module.exports = collection
