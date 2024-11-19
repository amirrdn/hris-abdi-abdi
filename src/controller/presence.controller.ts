import express, { Request, RequestHandler, Response } from "express";
import dbConnect from "../config/attendance";
import { PresenceModel } from "../entity/presence.entity";
import jwt, { JwtPayload } from "jsonwebtoken";
import createLogger from 'logging';
import moment from "moment";

const app = express();
app.use(express.json());
const NAMESPACE = 'presence';
let logger = createLogger(`${NAMESPACE}`);

interface Query{
    coordinate: string,
    dates: Date,
    times: string,
    ip_address: string,
    user_agent: string,
    description: string
    type_absen: string
}

export const InsertPresenece: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            coordinate,
            ip_address,
            user_agent,
            description,
            type_absen
        } = req.body as Query;

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

        // if (!coordinate || !/^POINT\(-?\d+(\.\d+)? -?\d+(\.\d+)?\)$/.test(coordinate)) {
        //     res.status(400).json({ message: 'Invalid coordinate format' });
        //     return;
        // }
        const userid = decoded.id;
        const datesv = moment().format('YYYY-MM-DD');
        const vtimes = moment().format('HH:mm:ss');
        
        const result = await dbConnect
        .createQueryBuilder()
        .insert()
        .into(PresenceModel)
        .values({
            dates: datesv,
            times: vtimes,
            coordinate: () => `ST_GeomFromText('${coordinate}', 4326)`, 
            type_absen,
            description,
            user_id: userid,
            user_agent,
            ip_address,
        })
        .execute();

        return res.status(200).json({
            data: result,
            message: 'success'
        }) as unknown as void;
    } catch (error: unknown) {
        logger.error('Error inserting presence', error);
        return res.status(400).json({
            error: (error as Error).message || 'Bad Request'
        }) as unknown as void;
    }
};
export const GetPrecence: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.sendStatus(401) as unknown as void; // Unauthorized if no token is provided
    }

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
        return res.sendStatus(401) as unknown as void; // Unauthorized if the token is invalid
    }

    const userid = decoded.id;
    const currendate = moment().format('YYYY-MM-DD');

    try {
        const dataprecence = await dbConnect.getRepository(PresenceModel)
            .createQueryBuilder('ps')
            .select('ps.*')
            .where('ps.user_id = :userid', { userid })
            .andWhere('ps.dates = :wheredate', { wheredate: currendate })
            .orderBy('ps.created_at', 'DESC')
            .getRawMany();
        const formattedData = dataprecence.map((item) => ({
            ...item,
            dates: moment(item.dates).format('YYYY-MM-DD') // Format the dates field
        }));
        return res.status(200).json({
            data: formattedData
        }) as unknown as void;
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error',
            error: (error as Error).message
        }) as unknown as void;
    }
};