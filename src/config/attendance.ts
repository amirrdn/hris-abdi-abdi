import { join } from 'path';
import { DataSource } from 'typeorm';
import 'dotenv/config';

const attendance = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST_ATTENDANCE || 'localhost', // Default to localhost if no environment variable is set
  port: 3306,
  username: process.env.MYSQL_USERNAME_ATTENDANCE || 'root',
  password: process.env.MYSQL_PASSWORD_ATTENDANCE || '12345678',
  database: process.env.MYSQL_DATABASE_ATTENDANCE || 'hris',
  logging: process.env.NODE_ENV !== 'production', // Log only in non-production environment
  entities: [join(__dirname, '../entity/*{.ts,.js}')], // Automatically load entities for both TS and JS environments
  synchronize: false, // Make sure you control migrations yourself in production
  dropSchema: false, // Do not drop schema on every app restart
  migrationsRun: false, // Handle migrations manually
  subscribers: [join(__dirname, '../subscriber/**/*.ts')], // Dynamically load subscribers
});

attendance
      .initialize()
      .then(() => {
          console.log(`Data Source has been initialized`);
      })
      .catch((err) => {
          console.error(`Data Source initialization error`, err);
      })
export default attendance;