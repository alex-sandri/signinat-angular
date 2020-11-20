import axios from "axios";

import { ISerializedApp } from "./App";

export class Webhook
{
    /**
     * @returns `boolean` Request success
    */
    public static send = async (app: ISerializedApp, data: any): Promise<boolean> =>
    {
        const response = await axios.post(
            app.api.webhook.url,
            {
                id: "TODO",
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