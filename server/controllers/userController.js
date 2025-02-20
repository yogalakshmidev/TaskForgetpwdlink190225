import userModel from "../models/userModel.js";

const userController = {
  getUserData: async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await userModel.findById(userId);

      if (!user) {
        return res
          .status(400)
          .json({ message: "User not found", success: false });
      }
      res.status(200).json({
        userData: {
          name: user.name,
          email: user.email,
          isAccountVerified: user.isAccountVerified,
        },
        success: true,
      });
    } catch (error) {
      res.status(500).json({ message: error.message, success: false });
    }
  },
};
export default userController;
