import axios from "axios";

import { ISerializedApp } from "./App";

type TWebhookType =
    "user.deleted";

interface IWebhookUserDeleted
{
    id: string,
}

export class Webhook
{
    /**
     * @returns `boolean` Request success
    */
    public static send = async (
        app: ISerializedApp,
        type: TWebhookType,
        data: IWebhookUserDeleted,
    ): Promise<boolean> =>
    {
        const response = await axios.post(
            app.api.webhook.url,
            {
                id: "TODO",
                type,
                data,
            },
            {
                headers: {
                    "Authorization": `Bearer ${app.api.webhook.signature}`,
                },
            },
        );

        return response.status === 200;
    }
}