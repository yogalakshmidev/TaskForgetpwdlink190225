import express from 'express';
import userAuth from '../middleware/userAuth.js';
import userController from '../controllers/userController.js';
const userRouter = express.Router();

// to get api
userRouter.get('/data',userAuth,userController.getUserData);

export default userRouter;