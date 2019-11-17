import crypto, { Utf8AsciiLatin1Encoding, HexBase64Latin1Encoding } from "crypto";

export class Checksum {
    static generate(data: any, algorithm?: string, encoding?: HexBase64Latin1Encoding, format?: Utf8AsciiLatin1Encoding) {
        return crypto.createHash(algorithm || 'md5').update(data, format || "ascii").digest(encoding || "hex");
    }

    static check(firstChecksum: string, secondChecksum: string) {
        return firstChecksum === secondChecksum ? true : false;
    }
}

export { HexBase64Latin1Encoding, Utf8AsciiLatin1Encoding }