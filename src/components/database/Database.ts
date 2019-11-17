import pg, { QueryResult } from "pg";

export class Database {
    private pool: pg.Pool;
    
    constructor() {
        this.pool = new pg.Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || "5432"),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    }

    async query(sql: string, vars?: any): Promise<QueryResult> {
        try {
            if (vars) {
                const query = await this.pool.query(sql, vars);
                return query;
            } else {
                const query = await this.pool.query(sql);
                return query;
            }
        } catch (err) {
            throw err;
        }
    }
}