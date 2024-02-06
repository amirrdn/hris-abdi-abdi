import {
    Router
} from "express";
import {
    verifyToken
} from "./utils/VerifyToken";
import {
    Login,
    checkRoles,
} from "./controller/auth.controller";
import {
    InsertPresenece,
    GetPrecence
} from "./controller/presence.controller";
const router = Router();

router.post('/auth/login', Login);
router.get('/get-roles', checkRoles, verifyToken);

router.post('/insert-precense', InsertPresenece, verifyToken);
router.get('/get-precence', GetPrecence, verifyToken);

export default router;