import express, { Request, Response } from "express";
import dbDcms from '../config/crm'
import { Timedimensions } from "../entity/timedimensions.entity";
import moment from "moment";
import createLogger from 'logging';

const app = express();
app.use(express.json);

const NAMESPACE = 'Calendar';
const logger = createLogger(`${NAMESPACE}`);
// @ts-ignore
export const GetHolidayDate = async (req: Request, res: Response) => {
    try{
        const holidaydate = await dbDcms.getRepository(Timedimensions)
                            .find({
                                where:{
                                    year: moment().format('YYYY'),
                                    weekend_flag: 't'
                                }
                            });
        res.status(200).json({
            message: 'success',
            code: 200,
            holidaydate
        });
    }catch(e){
        logger.error('add', e)
        res.status(400).json({
            message: 'error',
            error: e
        })
    }
}