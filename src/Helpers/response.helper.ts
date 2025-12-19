interface Resp<T = any> {
    statusCode: number,
    message?: string,
    data?: T,
    details?: []
}

export const ApiSuccess = <T = any>(message: string, data?: T): Resp<T> => {
    const resp: Resp<T> = { statusCode: 200, message };
    if (data) resp.data = data;
    return resp;
}

export const InternalServerError = (message?: string) => {
    const resp: Resp = { statusCode: 500, message: message && 'Something went wrong. Please check log' }
    return resp;
}

export const BadRequest = (message: string, details?: null) => {
    const resp: Resp = { statusCode: 400, message };
    if (details) resp.details = details;
    return resp;
}

export const NotFound = (message: string) => {
    const resp: Resp = { statusCode: 404, message };
    return resp;
}