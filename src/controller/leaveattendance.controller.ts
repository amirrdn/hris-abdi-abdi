import express, { Request, RequestHandler, Response } from "express";
import dbConnect from "../config/attendance";
import { LeaveAttendanceModel } from "../entity/leaveattendance.entity";
import { ApprovalModel } from "../entity/approval.entity";
import jwt from "jsonwebtoken";
import createLogger from 'logging';

const app = express();
app.use(express.json());
const NAMESPACE = 'presence';
let logger = createLogger(`${NAMESPACE}`);

interface LeaveAttendanceData {
    start_date: string;
    end_date: string;
    reasson: string;
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
    approval_id: number
}

export const InsertLeave: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const leaveAttendanceParams: LeaveAttendanceData = req.body;
    const approvalParams: ApprovalData = req.body;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' }) as unknown as void;
    }
    let user_id;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        user_id = decoded.id; // Assuming 'user_id' is in the token payload
        console.log('Decoded user_id:', user_id);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' }) as unknown as void;
    }

    const leaveAttendanceRepository = dbConnect.getRepository(LeaveAttendanceModel);
    const approvalRepository = dbConnect.getRepository(ApprovalModel);

    console.log(user_id);

    try {
        // Create new leave attendance record
        const newLeaveAttendance = new LeaveAttendanceModel();
        newLeaveAttendance.start_date = new Date(leaveAttendanceParams.start_date);
        newLeaveAttendance.end_date = new Date(leaveAttendanceParams.end_date);
        newLeaveAttendance.reasson = leaveAttendanceParams.reasson;
        newLeaveAttendance.assigned_to = leaveAttendanceParams.assigned_to;
        newLeaveAttendance.user_id = user_id;
        newLeaveAttendance.cuty_type = leaveAttendanceParams.cuty_type;

        const savedLeaveAttendance = await leaveAttendanceRepository.save(newLeaveAttendance);

        // Create new approval record
        const newApproval = new ApprovalModel();
        newApproval.leaveAttendance = savedLeaveAttendance; // Linking the leave attendance record
        newApproval.assigned_to = approvalParams.assigned_to;
        newApproval.approval_status = approvalParams.approval_status ?? 0;
        newApproval.approved_by = approvalParams.approved_by;
        newApproval.approved_at = approvalParams.approved_at;
        newApproval.comments = approvalParams.comments || '';

        const savedApproval = await approvalRepository.save(newApproval);

        // Send success response
        res.status(201).json({
            message: 'Leave attendance and approval saved successfully!',
            leaveAttendance: savedLeaveAttendance,
            approval: savedApproval,
        });
    } catch (error) {
        logger.error(error);
        console.error('Error inserting leave attendance and approval:', error);
        res.status(500).json({ message: 'Error saving leave attendance and approval.', error });
    }
};

export const showLeaveAttendance: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' }) as unknown as void;
    }
    let user_id;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        user_id = decoded.id; // Assuming 'user_id' is in the token payload
        console.log('Decoded user_id:', user_id);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' }) as unknown as void;
    }

    const leaveAttendanceRepository = dbConnect.getRepository(LeaveAttendanceModel);

    try {
        // Retrieve leave attendance for the current user with related approvals and leave type
        // const leaveAttendances = await leaveAttendanceRepository.find({
        //     where: [
        //         { user_id }, // Filter by user_id
        //         { assigned_to: user_id }, // Filter by assigned_to
        //     ],
        //     relations: ['approvals', 'cutytype'], // Fetch related approvals and leave type
        // });
        let leaveAttendances = await leaveAttendanceRepository.createQueryBuilder('leaveAttendance')
            .leftJoinAndSelect('leaveAttendance.approvals', 'approvals', 'approvals.approval_status = :approval_status', { approval_status: 0 })
            .leftJoinAndSelect('leaveAttendance.cutytype', 'cutytype') // Fetch related leave type
            .leftJoinAndSelect('leaveAttendance.user', 'user') // Join user table for user_id
            .leftJoinAndSelect('leaveAttendance.assignedUser', 'assignedUser') // Join user table for assigned_to
            .where('leaveAttendance.user_id = :user_id OR leaveAttendance.assigned_to = :user_id', { user_id })
            .getMany();

        // Ensure only one approval record per leaveAttendance
        leaveAttendances = leaveAttendances.map(leaveAttendance => {
            leaveAttendance.approvals = leaveAttendance.approvals.slice(0, 1); // Take only the first approval with approval_status = 0
            return leaveAttendance;
        });

        // Return the leave attendances with approvals and leave type
        res.status(200).json({
            message: 'Leave attendance and approval records retrieved successfully!',
            data: leaveAttendances,
        });
    } catch (error) {
        logger.error(error);
        console.error('Error retrieving leave attendance and approval records:', error);
        res.status(500).json({ message: 'Error retrieving leave attendance and approval records.', error });
    }
};
export const showLeaveDetail: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' }) as unknown as void;
    }

    let user_id;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        user_id = decoded.id; // Assuming 'user_id' is in the token payload
        console.log('Decoded user_id:', user_id);
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' }) as unknown as void;
    }

    // Extract the leave ID from the request parameters
    const leaveId = req.params.id;
    if (!leaveId) {
        return res.status(400).json({ message: 'Leave ID is required' }) as unknown as void;
    }

    const leaveAttendanceRepository = dbConnect.getRepository(LeaveAttendanceModel);

    try {
        // Fetch leave attendance details for the given leaveId
        const leaveAttendance = await leaveAttendanceRepository.createQueryBuilder('leaveAttendance')
            .leftJoinAndSelect('leaveAttendance.approvals', 'approvals')
            .leftJoinAndSelect('leaveAttendance.cutytype', 'cutytype') // Fetch related leave type
            .leftJoinAndSelect('leaveAttendance.user', 'user') // Join user table for user_id
            .leftJoinAndSelect('leaveAttendance.assignedUser', 'assignedUser') // Join assignedUser
            .where('leaveAttendance.id = :leaveId AND (leaveAttendance.user_id = :user_id OR leaveAttendance.assigned_to = :user_id)', { leaveId, user_id })
            .getOne(); // We are fetching a single leave attendance record

        if (!leaveAttendance) {
            return res.status(404).json({ message: 'Leave attendance not found' }) as unknown as void;
        }

        // Return the leave attendance details along with approvals and leave type
        res.status(200).json({
            message: 'Leave attendance detail retrieved successfully!',
            data: leaveAttendance,
        });
    } catch (error) {
        console.error('Error retrieving leave attendance detail:', error);
        res.status(500).json({ message: 'Error retrieving leave attendance detail.', error });
    }
};
export const UpdateApproval: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    // const { approval_id } = req.params;
    const updateData: Partial<ApprovalData> = req.body;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' }) as unknown as void;
    }

    let user_id;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        user_id = decoded.id;
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' }) as unknown as void;
    }

    const approvalRepository = dbConnect.getRepository(ApprovalModel);

    try {
        const existingApproval = await approvalRepository.findOne({
            where: { id: updateData.approval_id }, // Konversi id menjadi number
        });

        if (!existingApproval) {
            res.status(404).json({ message: 'Approval not found.' });
            return;
        }

        if (updateData.approval_status !== undefined) {
            existingApproval.approval_status = updateData.approval_status;
        }
        if (updateData.comments) {
            existingApproval.comments = updateData.comments;
        }
        if (updateData.approved_at) {
            existingApproval.approved_at = new Date(updateData.approved_at);
        } else {
            existingApproval.approved_at = new Date();
        }
        existingApproval.approved_by = user_id;

        const updatedApproval = await approvalRepository.save(existingApproval);

        try {
            const insertedApproval = await InsertApproval(req);
            res.status(200).json({
                message: 'Approval updated and new approval inserted successfully!',
                updatedApproval,
                insertedApproval,
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to insert new approval.', error });
        }
    } catch (error) {
        logger.error(error);
        console.error('Error updating approval:', error);
        res.status(500).json({ message: 'Error updating approval.', error });
    }
};

export const InsertApproval = async (req: Request): Promise<ApprovalModel | null> => {
    const approvalParams: ApprovalData = req.body;

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        throw new Error('No token provided');
    }

    let user_id;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
        user_id = decoded.id;
    } catch (error) {
        throw new Error('Unauthorized');
    }

    const approvalRepository = dbConnect.getRepository(ApprovalModel);
    const leaveAttendanceRepository = dbConnect.getRepository(LeaveAttendanceModel);

    try {
        // Validate if the leave attendance exists
        const leaveAttendance = await leaveAttendanceRepository.findOne({
            where: { id: approvalParams.leave_attendance_id },
        });

        if (!leaveAttendance) {
            throw new Error('Leave attendance not found.');
        }
        leaveAttendance.assigned_to = approvalParams.assigned_to;
        await leaveAttendanceRepository.save(leaveAttendance);
        // Create a new approval record
        const newApproval = new ApprovalModel();
        newApproval.leaveAttendance = leaveAttendance;
        newApproval.assigned_to = approvalParams.assigned_to;
        newApproval.approval_status = '0';
        newApproval.approved_by = user_id;
        newApproval.approved_at = approvalParams.approved_at || new Date();
        newApproval.comments = approvalParams.comments || '';

        return await approvalRepository.save(newApproval);
    } catch (error) {
        logger.error(error);
        throw error; // Throw error so the caller can handle it
    }
};

