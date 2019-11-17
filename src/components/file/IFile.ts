export interface IFile {
    id?: number
    run_id?: number
    name?: string
    data?: Buffer
    checksum?: string
    type?: string
}