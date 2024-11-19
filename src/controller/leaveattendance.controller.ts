import express, { Request, RequestHandler, Response } from "express";
import dbConnect from "../config/attendance";
import { LeaveAttendanceModel } from "../entity/leaveattendance.entity";
import { ApprovalModel } from "../entity/approval.entity";
import jwt, { JwtPayload } from "jsonwebtoken";
import createLogger from 'logging';

const app = express();
app.use(express.json());
const NAMESPACE = 'presence';
let logger = createLogger(`${NAMESPACE}`);

interface LeaveAttendanceData {
    start_date: string;
    end_date: string;
    reason: string;
    assigned_to: number;
    user_id: number;
    cuty_type: number;
}
interface ApprovalData {
    leave_attendance_id: number;
    assigned_to: number;
    approval_status: string;
    approved_by: number;
    approved_at: Date;
    comments?: string;
}

export const InsertLeave: RequestHandler = async(req: Request, res: Response) : Promise<void> => {
    const leaveAttendanceParams: LeaveAttendanceData = req.body.leaveAttendance;
    const approvalParams: ApprovalData = req.body.approval;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' }) as unknown as void;;
    }
    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' }) as unknown as void;;
    }
    const leaveAttendanceRepository = dbConnect.getRepository(LeaveAttendanceModel);
    const approvalRepository = dbConnect.getRepository(ApprovalModel);

    try{
        const newLeaveAttendance = new LeaveAttendanceModel();
        newLeaveAttendance.start_date = new Date(leaveAttendanceParams.start_date);
        newLeaveAttendance.end_date = new Date(leaveAttendanceParams.end_date);
        newLeaveAttendance.reasson = leaveAttendanceParams.reason;
        newLeaveAttendance.assigned_to = leaveAttendanceParams.assigned_to;
        newLeaveAttendance.user_id = leaveAttendanceParams.user_id;
        newLeaveAttendance.cuty_type = leaveAttendanceParams.cuty_type;

        const savedLeaveAttendance = await leaveAttendanceRepository.save(newLeaveAttendance);

        const newApproval = new ApprovalModel();
        newApproval.leaveAttendance = savedLeaveAttendance; // Linking the leave attendance record
        newApproval.assigned_to = approvalParams.assigned_to;
        newApproval.approval_status = approvalParams.approval_status;
        newApproval.approved_by = approvalParams.approved_by;
        newApproval.approved_at = approvalParams.approved_at;
        newApproval.comments = approvalParams.comments || '';

        const savedApproval = await approvalRepository.save(newApproval);

        res.status(201).json({
            message: 'Leave attendance and approval saved successfully!',
            leaveAttendance: savedLeaveAttendance,
            approval: savedApproval,
        });
    }catch(error){
        logger.error(error);
        console.error('Error inserting leave attendance and approval:', error);
        res.status(500).json({ message: 'Error saving leave attendance and approval.', error });
    }
}