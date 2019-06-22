import { format } from 'date-fns';

export function pushError(errors: string[] = [], error: Error | string, $notify?: Function) {
    errors.push(`[${format(Date.now(), 'HH:mm:ss')}] ${error}`);
    if ($notify) $notify({
    title: 'Error',
    text: '' + error,
    type: "error",
    });
}