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
import {
    getTypeLeave
} from "./controller/leavetype.controller";

import{
    GetHolidayDate
} from './controller/calendar.controller';
const router = Router();

router.post('/auth/login', Login);
router.get('/get-roles', checkRoles, verifyToken);

router.post('/insert-precense', InsertPresenece, verifyToken);
router.get('/get-precence', GetPrecence, verifyToken);
router.get('/get-type', getTypeLeave, verifyToken);
router.get('/get-calendar', GetHolidayDate, verifyToken);

export default router;