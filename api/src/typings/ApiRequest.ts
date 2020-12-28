export namespace ApiRequest
{
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