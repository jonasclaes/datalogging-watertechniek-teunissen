import { database, Database } from "../database";
import { Checksum, HexBase64Latin1Encoding, Utf8AsciiLatin1Encoding } from "../checksum";
import { IFile } from "./IFile";
import { EFileType } from "./EFileType";

export class File {
    private db: Database;
    private checksumHash: string;
    private checksumEncoding: HexBase64Latin1Encoding;
    private checksumFormat: Utf8AsciiLatin1Encoding;

    constructor() {
        this.db = database;
        this.checksumHash = "md5";
        this.checksumEncoding = "hex";
        this.checksumFormat = "utf8";
    }

    /**
     * Insert a new file row.
     * @param ref Test id reference.
     * @param name File name.
     * @param data File data.
     */
    async create(ref: number, name: string, data: string, type: EFileType): Promise<number> {
        const hexData = Buffer.from(data, "hex");
        const checksum = Checksum.generate(hexData, this.checksumHash, this.checksumEncoding, this.checksumFormat);

        const query = await this.db.query("INSERT INTO files (run_id, name, data, checksum, type) VALUES ($1, $2, $3, $4, $5)", [ref, name, hexData, checksum, type]);

        return query.rowCount;
    }

    /**
     * Get all rows.
     */
    async read(run_id?: number, limit?: number, offset?: number): Promise<Array<IFile>> {
        let query;

        if (run_id) {
            query = await this.db.query("SELECT id, run_id, name, encode(data::bytea, 'hex') AS data, checksum, type FROM files WHERE run_id = $1 LIMIT $2 OFFSET $3", [run_id, limit || 10, offset ||0]);
        } else {
            query = await this.db.query("SELECT id, run_id, name, checksum, type FROM files LIMIT $1 OFFSET $2", [limit || 50, offset || 0]);
        }

        const rows: Array<IFile> = <Array<IFile>> query.rows;

        for (let row of query.rows) {
            if (row.data) {
                let checksum = Checksum.generate(Buffer.from(row.data, "hex"), this.checksumHash, this.checksumEncoding, this.checksumFormat);

                if (!Checksum.check(row.checksum, checksum)) {
                    throw new Error("Checksum failed, invalid data. Corruption?");
                }
            }
        }

        return rows;
    }

    /**
     * Update a file row.
     * @param id Id of the row.
     * @param run_id Run id.
     * @param name File name.
     * @param data File data.
     */
    async update(id: number, run_id: number, name: string, data: string, type: EFileType) {
        const hexData = Buffer.from(data, "hex");
        const checksum = Checksum.generate(hexData, this.checksumHash, this.checksumEncoding, this.checksumFormat);

        const query = await this.db.query("UPDATE files SET run_id = $1, name = $2, data = $3, checksum = $4, type = $5 WHERE id = $6", [run_id, name, hexData, checksum, type, id]);

        return query.rowCount;
    }

    /**
     * Delete a file row.
     * @param id Id of the row.
     */
    async delete(id: number) {
        const query = await this.db.query("DELETE FROM files WHERE id = $1", [id]);

        return query.rowCount;
    }
}