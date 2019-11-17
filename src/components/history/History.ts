import { database, Database } from "../database";

export class History {
    private db: Database;

    constructor() {
        this.db = database;
    }

    /**
     * Insert a new test row.
     * @param name Test name.
     * @param date Test date.
     * @param client Test client.
     * @param pump Test pump.
     */
    async create(name: string, date: string, client: string, pump: string, data: Array<Array<any>>) {
        try {
            const query = await this.db.query("INSERT INTO runs (name, date, client, pump, data) VALUES ($1, $2, $3, $4, $5) RETURNING *", [name, date, client, pump, data]);

            return query.rows;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get all rows.
     */
    async read(name?: string, limit?: number, offset?: number) {
        let query;

        if (name) {
            query = await this.db.query("SELECT id, name, date, client, pump FROM runs WHERE name ~* $1 ORDER BY date desc LIMIT $2 OFFSET $3", [name, limit || 50, offset || 0]);
        } else {
            query = await this.db.query("SELECT id, name, date, client, pump FROM runs ORDER BY date desc LIMIT $1 OFFSET $2", [limit || 50, offset || 0]);
        }

        return query.rows;
    }

    /**
     * Get all rows by id.
     */
    async readbyId(id: number) {
        const query = await this.db.query("SELECT id, name, date, client, pump, data FROM runs WHERE id = $1", [id]);

        return query.rows;
    }

    /**
     * Update a test row.
     * @param id Id of the row.
     * @param name Test name.
     * @param date Test date.
     * @param client Test client.
     * @param pump Test pump.
     */
    async update(id: number, name: string, date: string, client: string, pump: string, data: Array<Array<any>>) {
        const query = await this.db.query("UPDATE runs SET name = $1, date = $2, client = $3, pump = $4, data = $5 WHERE id = $6 RETURNING *", [name, date, client, pump, data, id]);

        return query.rows;
    }

    /**
     * Delete a test row.
     * @param id Id of the row.
     */
    async delete(id: number) {
        const query = await this.db.query("DELETE FROM runs WHERE id = $1", [id]);

        return query.rowCount;
    }

    /**
     * Count all rows.
     */
    async count(name?: string) {
        let query;

        if (name) {
            query = await this.db.query("SELECT COUNT(*) FROM runs WHERE name ~* $1", [name]);
        } else {
            query = await this.db.query("SELECT COUNT(*) FROM runs");
        }

        return parseInt(query.rows[0].count);
    }
}