import express from 'express';
import {login,getUsers,createUser,updateUser,deleteUser} from "../controllers/users.controller.js"
import { protectRoute } from '../middleware/auth.middlware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const userRouter=express.Router();

userRouter.post("/login", login);
userRouter.get("/",protectRoute,authorizeRoles("hr","admin"),getUsers);
userRouter.post("/", protectRoute,authorizeRoles("hr","admin"),createUser);
userRouter.put("/:id",protectRoute,authorizeRoles("hr","admin"),updateUser);
userRouter.delete("/:id", protectRoute,authorizeRoles("hr","admin"),deleteUser);

export default userRouter;



