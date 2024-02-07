import express, { Request, Response } from "express";
import dbConnect from "../config/attendance";
import { LeaveTypeModel } from "../entity/leave_type.entity";

const app = express();
app.use(express.json());

// interface Query{
//     type_name: string;
//     status: number
// }
// @ts-ignore
export const getTypeLeave = async (req: Request , res: Response) => {
    const datatype = await dbConnect.getRepository(LeaveTypeModel).find({
        order:{
            "type_name": 'ASC'
        }
    });
    res.status(200).json({
        data: datatype
    });
}