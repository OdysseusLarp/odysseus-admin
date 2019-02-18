
interface DataBlob {
    id: string,
    type: string,
    created_at: string,
    updated_at: string,
    version: number,
    [x: string]: any 
}

export interface State {
    dataBlobs: DataBlob[],
    backend: {
        uri: string,
        username?: string,
        password?: string,
        autoRefresh?: number,
    }
}
