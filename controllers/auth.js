import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'


// REGISTER USER //
export const register = async (req, res) =>{
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt)
   
        const newUser = new User({
            firstName,
            lastName,
            email,
            password : passwordHash,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000),

        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}

// LOGGING IN //

export const login = async (req, res) =>{
    try {
        // we need only email and password so make this like a var and save a email and password in it
        const {email, password} = req.body
        // so we have to find by email thats why we check email if u checing by name u can select
        const user = await User.findOne({email:email})
        if(!user) return res.status(400).json({message: "User does not exist"})

        //now its time to check out salt hashed password with our real password so we compare user enterd password with 
        // our saved hashed password in db
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({ message:"invalid credentials"});

       // this is a token for user we can make it for admin etc.
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
       // delete the password from cookies maybe for securing it
        delete user.password;
        res.status(200).json({token, user, message:"Login succesful"})
    } catch (err) {
        res.status(500).json({error: err.message})       
    }
}