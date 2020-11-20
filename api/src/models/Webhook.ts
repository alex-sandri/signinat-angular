import axios from "axios";

import { App } from "./App";

interface WebhookBody
{
    id: string,
    signature: string, // TODO
    data: any,
}

export class Webhook
{
    /**
     * @returns `boolean` Request success
    */
    public static send = async (app: App, body: WebhookBody): Promise<boolean> =>
    {
        const response = await axios.post(
            app.webhook,
            body,
            {
                headers: {
                    "Authorization": `Bearer ${app.webhook}`,
                },
            },
        );

        return response.status === 200;
    }
}