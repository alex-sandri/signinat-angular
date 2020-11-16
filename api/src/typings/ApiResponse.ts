import { ISerializedApp } from "../models/App";
import { ISerializedSession } from "../models/Session";
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
}