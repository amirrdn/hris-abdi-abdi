import { join } from 'path';
import { DataSource } from 'typeorm';
import 'dotenv/config';

const NODE_ENV = process.env.NODE_ENV || 'dev';

let config: {
  host: string | undefined;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
};

NODE_ENV === 'prod'
  ? (config = {
      host: 'localhost',
      user: 'sewa_admin',
      password: '^xgAa+Gm8@6Lbx*z',
      database: 'sewa_sewaja',
    })
  : (config = {
      host: process.env.MYSQL_HOST_ATTENDANCE,
      user: process.env.MYSQL_USERNAME_ATTENDANCE,
      password: process.env.MYSQL_PASSWORD_ATTENDANCE,
      database: process.env.MYSQL_DATABASE_ATTENDANCE,
    });

const dbcrm = new DataSource({
    type: 'mysql',
    host: config.host || 'localhost',
    port: 3306,
    username: config.user || 'root',
    password: config.password || '',
    database: config.database || '',
    logging: process.env.NODE_ENV === 'prod' ? false : true,
    entities: [join(__dirname, '../entity/*{.ts,.js}')],
    synchronize: false,
    dropSchema: false,
    migrationsRun: false,
    subscribers: ["src/subscriber/**/*.ts"],
  });
  dbcrm
      .initialize()
      .then(() => {
          console.log(`Data Source has been initialized`);
      })
      .catch((err) => {
          console.error(`Data Source initialization error`, err);
      })
export default dbcrm;