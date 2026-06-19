export interface ApiResponse<T = unknown> {
    statusCode: number
    message?: string
    data?: T
    details?: string[]
}

export const ApiSuccess = <T = unknown>(message: string, data?: T): ApiResponse<T> => {
    const resp: ApiResponse<T> = { statusCode: 200, message }
    if (data !== undefined) resp.data = data
    return resp
}

export const InternalServerError = (message?: string): ApiResponse => {
    return { statusCode: 500, message: message || 'Something went wrong. Please check log' }
}

export const BadRequest = (message: string, details?: string[]): ApiResponse => {
    const resp: ApiResponse = { statusCode: 400, message }
    if (details) resp.details = details
    return resp
}

export const NotFound = (message: string): ApiResponse => {
    return { statusCode: 404, message }
}
