import {
    Router
} from "express";

import {
    Login,
    checkRoles,
    SetPassword
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
import {
    verifyToken
} from "./utils/VerifyToken";
import { InsertLeave, showLeaveAttendance, showLeaveDetail, UpdateApproval } from './controller/leaveattendance.controller'
const router = Router();

router.post('/auth/login', Login);
router.get('/get-roles', verifyToken, checkRoles);
router.post('/users/set-password', verifyToken, SetPassword);

router.post('/insert-precense', verifyToken, InsertPresenece);
router.get('/get-precence', GetPrecence, verifyToken);
router.get('/get-type', getTypeLeave, verifyToken);
router.get('/get-calendar', GetHolidayDate, verifyToken);

router.post('/insert-leave', verifyToken, InsertLeave);
router.get('/get-data-leave', showLeaveAttendance, verifyToken);
router.get('/get-detail-leave/:id', showLeaveDetail, verifyToken);
router.post('/update-approval', verifyToken, UpdateApproval);

export default router;