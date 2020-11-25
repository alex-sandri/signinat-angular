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
                    first: string,
                    last: string,
                },
                email: string,
                password: string,
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
                name: string,
                url: string,
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
                    webhook: string,
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