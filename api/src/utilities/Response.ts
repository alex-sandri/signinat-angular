import { Response as ExpressResponse } from "express";
import { AuthToken, TAuthTokenType } from "../models/AuthToken";

export interface IResponseData
{
    resource?: any;
    errors?: {
        id: string;
        message: string;
    }[];
}

export default class Response
{
    private constructor(private res: ExpressResponse)
    {}

    public static from(res: ExpressResponse): Response
    {
        return new Response(res);
    }

    public async checkAuth(token?: string, types?: TAuthTokenType[]): Promise<AuthToken | null>
    {
        const authToken = await AuthToken.retrieve(token);

        if (!authToken)
        {
            this.unauthorized();

            return null;
        }

        if (types && !types.includes(authToken.type))
        {
            this.forbidden();

            return null;
        }

        return authToken;
    }

    public ok(): void
    {
        this.res.status(200);

        this.res.send({ status: { code: 200, message: "OK" } });
    }

    public unauthorized(): void
    {
        this.res.status(401);

        this.res.send({ status: { code: 401, message: "Unauthorized" } });
    }

    public forbidden(): void
    {
        this.res.status(403);

        this.res.send({ status: { code: 403, message: "Forbidden" } });
    }

    public notFound(): void
    {
        this.res.status(404);

        this.res.send({ status: { code: 404, message: "Not Found" } });
    }

    public send(data?: IResponseData): void
    {
        if (!data)
        {
            this.ok();

            return;
        }

        if (data.errors)
        {
            this.res.status(400);
        }

        this.res.send(data);
    }
}