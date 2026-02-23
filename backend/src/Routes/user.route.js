const {Router} = require("express");

const router = Router();
import {login} from "../Controllers/user.controller.js";
import {register} from "../Controllers/user.controller.js";
// import { verifyToken} from '../middleware/auth.middleware.js'; 


router.post("/login", login);
router.post("/register", register);

export default router;