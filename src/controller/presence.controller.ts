import express, { Request, Response } from "express";
// import { Point } from "typeorm";
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

export const InsertPresenece = async(req: Request, res: Response) => {
    try{
        const {
            coordinate,
            dates,
            times,
            ip_address,
            user_agent,
            description,
            type_absen
        } = req.body as Query;
    
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            } catch (error) {
                return res.sendStatus(401);
            }
            const userid = decoded.id;
            const insertdata = await dbConnect.getRepository(PresenceModel).
            save({
                dates: dates,
                times: times,
                coordinate: coordinate,
                type_absen: type_absen,
                description: description,
                user_id: userid,
                user_agent: user_agent,
                ip_address: ip_address,
    
            });
            res.status(200).json({
                data: insertdata,
                message: 'success'
            });
        }
    } catch (error) {
        logger.error('add', error)
        res.sendStatus(400).json({
            error: error
        })
    }
}
export const GetPrecence = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let decoded;
    try {
        decoded = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
        return res.sendStatus(401);
    }
    const userid = decoded.id;
    const currendate = moment().format('YYYY-MM-DD');
    const dataprecence = await dbConnect.getRepository(PresenceModel)
                        .createQueryBuilder('ps')
                        .select('ps.*')
                        .where('ps.user_id = :userid')
                        .setParameter('userid', userid)
                        .andWhere('dates = :wheredate')
                        .setParameter('wheredate', currendate)
                        .getRawMany();
    res.status(200).json({
        data: dataprecence
    });
}