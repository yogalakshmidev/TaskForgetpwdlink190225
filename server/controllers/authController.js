import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

const authController = {
  register: async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }
    try {
      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exist", success: false });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new userModel({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      // secure will be false for development environment and true for production environment
      // sameSite will be strict for local and for live server sameSite will be null
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      // sending welcome email
      const mailOptions = {
        from: process.env.EMAILID,
        to: email,
        subject: "Welcome to the Authentication App",
        text: `Welcome to the Authentication Application. Your account has been created successfully with this
  email id : ${email}`,
      };

      await transporter.sendMail(mailOptions);

      return res
        .status(200)
        .json({ message: "mail sent successfully", success: true });

      // success message
      return res
        .status(201)
        .json({ success: true, message: "User registrated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }
    try {
      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(400).json({
          message: "User does not exist or invalid email",
          success: false,
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ message: "Invalid password", success: false });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(201)
        .json({ success: true, message: "Logged in successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      return res
        .status(200)
        .json({ message: "Logged out Successfully", success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  },
  sendResetOtp: async(req,res)=>{
    const { email }= req.body;
    if(!email){
      return res.status(400).json({message:'email is required',success:false});
    }
    try {
      const user = await userModel.findOne({email});
      if(!user){
        return res.status(400).json({message:'user not found',success:false});
      }
//  to generate OTP which expires in 15mins
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.resetOtp = otp;
      user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

      await user.save();

       // send email
       const mailOptions = {
        from: process.env.EMAILID,
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your OTP  for reseting your password is ${otp}.Use this OTP to proceed with resetting your password.`,
      };
      await transporter.sendMail(mailOptions);

      res.status(200).json({message:'Otp sent to your email',success : true})
      
    } catch (error) {
       res.status(500).json({message:error.message,success:false});
    }
  },
  // reset user password
  resetPassword: async(req, res)=>{
    const { email, otp, newPassword }= req.body;
    if(!email || !otp || !newPassword){
     return res.status(400).json({message:'Email, otp and  new password are required ',success : false});
    }
     try {
      const user = await userModel.findOne({email});
      if(!user){
        return res.status(400).json({message:'User not found ',success : false});
      }
      if(user.resetOtp === '' || user.resetOtp !== otp){
        return res.status(400).json({message:'Invalid Otp ',success : false});
      }
      if(user.resetOtpExpireAt < Date.now()){
        return res.status(400).json({message:'Otp Expired',success : false});
      }
      
      const hashedPassword = await bcrypt.hash(newPassword,10);

      user.password = hashedPassword;

      user.resetOtp = '';
      user.resetOtpExpireAt = 0;

      await user.save();
      
       res.status(500).json({message:'Password has been updated successfully ',success : true});
     } 
     catch (error) {
     return res.status(500).json({message:error.message,success : false});
      
     }
    }
  
 
};
export default authController;
