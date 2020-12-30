import { Response as ExpressResponse } from "express";

export interface IResponseData
{
    resource?: any,
    errors?: {
        id: string,
        message: string,
    }[],
}

export default class Response
{
    private constructor(private res: ExpressResponse)
    {}

    public static from(res: ExpressResponse): Response
    {
        return new Response(res);
    }

    public unauthorized(): void
    {
        this.res.status(401);

        this.send({ errors: [ { id: "401", message: "Unauthorized" } ] });
    }

    public forbidden(): void
    {
        this.res.status(403);

        this.send({ errors: [ { id: "403", message: "Forbidden" } ] });
    }

    public send(data?: IResponseData): void
    {
        if (data?.errors?.length ?? 0 > 0)
        {
            this.res.status(400);
        }

        this.res.send(data);
    }
}