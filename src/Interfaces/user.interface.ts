export interface LoginIntfc {
    email: string,
    password: string
}

export interface UserIntfc {
    email: string
}

export interface AddProfileIntfc {
    name: string
    gender: string
    phone: number
    address: string
    userId: string
}