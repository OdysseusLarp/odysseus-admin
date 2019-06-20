import { format } from 'date-fns';

export function pushError(errors: string[] = [], error: Error | string) {
    errors.push(`[${format(Date.now(), 'HH:mm:ss')}] ${error}`)
}