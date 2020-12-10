export namespace ApiRequest
{
    export namespace Users
    {
        export interface Create
        {
            name: {
                first: string,
                last: string,
            },
            email: string,
            password: string,
            birthday?: string,
        }

        export interface Update
        {
            name?: {
                first?: string,
                last?: string,
            },
            email?: string,
            birthday?: string,
        }
    }

    export namespace Apps
    {
        export interface Create
        {
            name: string,
            url: string,
            scopes: string[],
        }

        export interface Update
        {
            api: {
                webhook: string,
            },
        }
    }

    export namespace Tokens
    {
        export interface Create
        {
            app?: string,

            user?: {
                email: string,
                password: string,
            },
        }
    }
}