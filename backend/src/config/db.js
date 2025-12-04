import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    options: {
        encrypt: false,
        enableArithAbort: true,
    },
    port: parseInt(process.env.DB_PORT, 10) || 1433,
};

let pool;

export const getPool = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log("Connected to MSSQL");
        }
        return pool;
    } catch (err) {
        console.log("Database Connection Failed! Bad Config: ", err);
        throw err;
    }
};