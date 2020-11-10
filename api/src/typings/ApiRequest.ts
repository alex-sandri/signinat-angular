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
        }
    }

    export namespace Accounts
    {
        export interface Create
        {
            // TODO
        }
    }

    export namespace Sessions
    {
        export interface Create
        {
            email: string,
            password: string,
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
    }
}