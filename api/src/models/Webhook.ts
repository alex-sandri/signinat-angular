import { firestore } from "firebase-admin";
import axios from "axios";

import { ISerializedApp } from "./App";

const db = firestore();

type TWebhookType =
    "user.deleted";

interface IWebhook
{
    app: string,
    type: TWebhookType,
    data: IWebhookUserDeleted,
}

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
        const snapshot = await db.collection("webhooks").add(<IWebhook>{
            app: app.id,
            type,
            data,
        });

        const response = await axios.post(
            app.api.webhook.url,
            {
                id: snapshot.id,
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