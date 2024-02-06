import moment from "moment";
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

export async function uploadFiles(params: any[]) {
    const stringname = moment().format("HH-mm-ss");
    const pathdata = './storage/images/' + moment().format('YYYY') + '/' + moment().format('MM') + '/' + moment().format('DD');
    const pathdatadb = process.env.BASE_URL + 'storage/images/' + moment().format('YYYY') + '/' + moment().format('MM') + '/' + moment().format('DD');

    if (!fs.existsSync(pathdata)) { // CREATE DIRECTORY IF NOT FOUND
        fs.mkdirSync(pathdata, {
            recursive: true
        });
    }
    let datainsert: any[] = [];
    for (let i = 0; i < params.length; i++) {
        if (params[i].file_name === null) {
            return {
                message: 'nama file tidak boleh kosong',
                code: 400
            }
        }
        const [, type] = params[i].files.split(';')[0].split('/');
        const filesd = pathdatadb + '/' + params[i].file_name + '-' + stringname + '.' + type;

        let base64image = params[i].files.split(';base64,').pop();
        fs.writeFile(pathdata + '/' + params[i].file_name + '-' + stringname + '.' + type, base64image, {
            encoding: 'base64'
        }, function (err) {
            return err
        })
        datainsert.push({
            files: filesd,
        })
    }
}