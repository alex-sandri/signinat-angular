export namespace ApiRequest
{
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