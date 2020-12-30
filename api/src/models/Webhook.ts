import { firestore } from "firebase-admin";
import axios from "axios";

import { ISerializedApp } from "./App";
import { ISerializedUser } from "./User";
import Utilities from "../utilities/Utilities";

const db = firestore();

type TWebhookType =
    "user.created"
    | "user.deleted";

type TWebhookData =
    IWebhookUserCreated
    | IWebhookUserDeleted;

interface IWebhook
{
    app: string,
    type: TWebhookType,
    data: TWebhookData,
}

interface IWebhookUserCreated
{
    user: ISerializedUser,
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
        data: TWebhookData,
    ): Promise<boolean> =>
    {
        if (Utilities.isNullOrUndefined(app.api.webhook.url))
        {
            return false;
        }

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