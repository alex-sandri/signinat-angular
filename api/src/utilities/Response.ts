import { Response as ExpressResponse } from "express";
import { AuthToken, TAuthTokenType } from "../models/AuthToken";

type IResponseStatusOk = { code: 200, message: "OK" };
type IResponseStatusBadRequest = { code: 400, message: "Bad Request" };
type IResponseStatusUnauthorized = { code: 401, message: "Unauthorized" };
type IResponseStatusForbidden = { code: 403, message: "Forbidden" };
type IResponseStatusNotFound = { code: 404, message: "Not Found" };

type IResponseStatus =
| IResponseStatusOk
| IResponseStatusBadRequest
| IResponseStatusUnauthorized
| IResponseStatusForbidden
| IResponseStatusNotFound;

export interface IResponseData
{
    status?: IResponseStatus;
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
        this.send({ status: { code: 200, message: "OK" } });
    }

    public unauthorized(): void
    {
        this.send({ status: { code: 401, message: "Unauthorized" } });
    }

    public forbidden(): void
    {
        this.send({ status: { code: 403, message: "Forbidden" } });
    }

    public notFound(): void
    {
        this.send({ status: { code: 404, message: "Not Found" } });
    }

    public send(data?: IResponseData): void
    {
        if (!data)
        {
            this.ok();

            return;
        }

        if (data.status)
        {
            this.res.status(data.status.code);
        }

        if (data.errors)
        {
            this.res.status(400);
        }

        this.res.send(data);
    }
}