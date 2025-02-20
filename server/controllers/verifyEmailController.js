import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
const verifyEmailController = {
  // send verification otp to the user's email
  sendVerifyOtp: async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await userModel.findById(userId);

      if (user.isAccountVerified) {
        return res
          .status(400)
          .json({ message: "Account already verified", success: false });
      }
      // it will generate the 6 digit random number otp
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

      await user.save();
      // send email
      const mailOptions = {
        from: process.env.EMAILID,
        to: user.email,
        subject: "Account verification OTP",
        text: `Your OTP is ${otp}. verify your account using this OTP.`,
      };
      await transporter.sendMail(mailOptions);

      res
        .status(200)
        .json({
          message: "verification OTP sent on your Email",
          success: true,
        });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  },
  // verify email using otp
  verifyEmail: async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res
        .status(400)
        .json({ message: "Missing Details", success: false });
    }
    try {
      const user = await userModel.findById(userId);

      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found", success: false });
      }

      if (user.verifyOtp === "" || user.verifyOtp !== otp) {
        return res.status(400).json({ message: "Invalid otp", success: false });
      }

      if (user.verifyOtpExpireAt < Date.now()) {
        return res.status(400).json({ message: "otp expires", success: false });
      }

      user.isAccountVerified = true;
      user.verifyOtp = "";
      user.verifyOtpExpireAt = 0;

      await user.save();

      return res
        .status(200)
        .json({ message: "Email verified successfully", success: true });
    } catch (error) {
       res.status(500).json({ message: error.message, success: false });
    }
  },
  isAuthenticated: async(req, res)=>{
    // check if the user is authenticated
    try {

      res.status(200).json({ message: 'User authenticated already', success: true });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  }
};

export default verifyEmailController;
