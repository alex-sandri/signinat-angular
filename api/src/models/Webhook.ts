import { firestore } from "firebase-admin";
import axios from "axios";

import { ISerializedApp } from "./App";
import { ISerializedUser } from "./User";
import Utilities from "../utilities/Utilities";

const db = firestore();

type TWebhookType =
| "user.created"
| "user.deleted";

type TWebhookData =
| IWebhookUserCreated
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
    public static async send(
        app: ISerializedApp,
        type: TWebhookType,
        data: TWebhookData,
    ): Promise<boolean>
    {
        const url = app.api.webhook.url;

        if (Utilities.isNullOrUndefined(url))
        {
            return false;
        }

        return new Promise(resolve =>
        {
            const webhook: IWebhook = {
                app: app.id,
                type,
                data,
            };

            db
                .collection("webhooks")
                .add(webhook)
                .then(snapshot =>
                {
                    axios
                        .post(
                            url,
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
                        )
                        .then(response => resolve(response.status === 200))
                        .catch(() => resolve(false));
                })
                .catch(() => resolve(false));
        });
    }
}