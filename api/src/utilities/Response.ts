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
    status: IResponseStatus;
    data?: any;
    errors?: {
        id: string;
        message: string;
    }[];
}

export default class Response
{
    public body: IResponseData = { status: { code: 200, message: "OK" } };

    private constructor(private res: ExpressResponse)
    {}

    public static from(res: ExpressResponse): Response
    {
        return new Response(res);
    }

    public async checkAuth(types: TAuthTokenType[], token?: string): Promise<AuthToken | null>
    {
        const authToken = await AuthToken.retrieve(token);

        if (!authToken)
        {
            this.unauthorized();

            return null;
        }

        if (!types.includes(authToken.type))
        {
            this.forbidden();

            return null;
        }

        return authToken;
    }

    public ok(): void
    {
        this.body = { status: { code: 200, message: "OK" } };

        this.send();
    }

    public unauthorized(): void
    {
        this.body = { status: { code: 401, message: "Unauthorized" } };

        this.send();
    }

    public forbidden(): void
    {
        this.body = { status: { code: 403, message: "Forbidden" } };

        this.send();
    }

    public notFound(): void
    {
        this.body = { status: { code: 404, message: "Not Found" } };

        this.send();
    }

    public send(): void
    {
        this.res.status(this.body.status.code);

        if (this.body.errors)
        {
            this.res.status(400);

            this.body.status = { code: 400, message: "Bad Request" };
        }
        else if (this.body.data)
        {
            this.res.status(200);

            this.body.status = { code: 200, message: "OK" };
        }

        this.res.send(this.body);
    }
}