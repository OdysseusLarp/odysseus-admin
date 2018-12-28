export interface State {
    backend: {
        uri: string,
        username?: string,
        password?: string,
        autoRefresh?: number,
    }
}
