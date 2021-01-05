import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import AuthToken, { TAuthTokenType } from "../models/AuthToken";
import Response from "./Response";

type TCallbackType = (request: ExpressRequest, response: Response, token: AuthToken) => void;

export default class AuthMiddleware
{
    public constructor(
        private types: TAuthTokenType[],
        private callback: TCallbackType
    )
    {}

    public static init(types: TAuthTokenType[], callback: TCallbackType): (req: ExpressRequest, res: ExpressResponse) => Promise<void>
    {
        const middleware = new AuthMiddleware(types, callback);

        return (req: ExpressRequest, res: ExpressResponse) => middleware.use(req, res);
    }

    public async use(req: ExpressRequest, res: ExpressResponse): Promise<void>
    {
        const response = Response.from(res);

        const token = await AuthToken.retrieve(req.token);

        if (!token)
        {
            response.unauthorized();

            return;
        }

        if (!this.types.includes(token.type))
        {
            response.forbidden();

            return;
        }

        if (!token)
        {
            return;
        }

        this.callback(req, response, token);
    }
}