import { ISerializedApp } from "../models/App";
import { ISerializedAuthToken } from "../models/AuthToken";
import { ISerializedUser } from "../models/User";

export namespace ApiResponse
{
    export namespace Users
    {
        export interface Create
        {
            result: {
                valid: boolean,
                data?: ISerializedUser,
            },
            errors: {
                name: {
                    first: {
                        error: string,
                    },
                    last: {
                        error: string,
                    },
                },
                email: {
                    error: string,
                },
                password: {
                    error: string,
                },
                birthday: string,
            },
        }

        export interface Update
        {
            result: {
                valid: boolean,
                data?: ISerializedUser,
            },
            errors: {
                name: {
                    first: string,
                    last: string,
                },
                email: string,
            },
        }
    }

    export namespace Apps
    {
        export interface Create
        {
            result: {
                valid: boolean,
                data?: ISerializedApp,
            },
            errors: {
                name: {
                    error: string,
                },
                url: {
                    error: string,
                },
            },
        }

        export interface Update
        {
            result: {
                valid: boolean,
                data?: ISerializedApp,
            },
            errors: {
                api: {
                    webhook: {
                        error: string,
                    },
                },
            },
        }
    }

    export namespace Tokens
    {
        export interface Create
        {
            result: {
                valid: boolean,
                data?: ISerializedAuthToken,
            },
            errors: {
                user: {
                    email: string,
                    password: string,
                },
            },
        }
    }
}