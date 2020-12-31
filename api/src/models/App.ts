import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

import { IApp, Validator } from "../utilities/Validator";
import { Account } from "./Account";
import { ISerializedScope, Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

const db = firestore();

interface IDatabaseApp
{
    name: string,
    url: string,
    owner: string,
    api: {
        key: string,
        webhook: {
            url?: string,
            signature: string,
        },
    },
}

export interface ISerializedApp
{
    id: string,
    name: string,
    url: string,
    owner: ISerializedUser,
    // TODO: Send API key only if the signed in user is the owner
    api: {
        key: string,
        webhook: {
            url?: string,
            signature: string,
        },
    },
    scopes: ISerializedScope[],
}

export class App
{
    private constructor(
        public readonly id: string,
        public readonly data: IDatabaseApp,
        public readonly scopes: Scope[],
    )
    {}

    public async json(): Promise<ISerializedApp>
    {
        return {
            id: this.id,
            name: this.data.name,
            url: this.data.url,
            owner: (await User.retrieve(this.data.owner))!.json(),
            api: {
                key: this.data.api.key,
                webhook: {
                    url: this.data.api.webhook.url,
                    signature: this.data.api.webhook.signature,
                },
            },
            scopes: this.scopes.map(scope => scope.json()),
        };
    };

    static create = async (user: User, data: IApp): Promise<App> =>
    {
        const result = await Validator.of("create").app(data);

        if (!result.valid)
        {
            throw result;
        }

        const app: IDatabaseApp = {
            name: data.name!.trim(),
            url: data.url!.trim(),
            owner: user.id,
            api: {
                key: uuidv4(),
                webhook: {
                    url: data.api?.webhook?.url,
                    signature: uuidv4(),
                },
            },
        };

        const { id } = await db.collection("apps").add(app);

        const scopes = Scope.from(data.scopes!);

        await Scope.set(id, scopes);

        return new App(id, app, scopes);
    }

    static retrieve = async (id: string): Promise<App | null> =>
    {
        const app = await db.collection("apps").doc(id).get();

        if (!app.exists) return null;

        const data = app.data() as IDatabaseApp;

        const scopes = await Scope.list(app.id);

        return new App(id, data, scopes);
    }

    static list = async (user: User): Promise<App[]> =>
    {
        const snapshot = await db.collection("apps").where("owner", "==", user.id).get();

        const apps: App[] = [];

        snapshot.docs.forEach(app =>
        {
            const data = app.data() as IDatabaseApp;

            // Scopes are not sent with a LIST operation
            apps.push(new App(app.id, data, []));
        });

        return apps;
    }

    public update = async (data: IApp): Promise<void> =>
    {
        const result = await Validator.of("update").app(data, await this.json());

        if (!result.valid)
        {
            throw result;
        }

        this.data.api.webhook.url = data.api?.webhook?.url;

        await db.collection("apps").doc(this.id).update(this.data);
    }

    public delete = async (): Promise<void> =>
    {
        await db.collection("apps").doc(this.id).delete();

        await Scope.delete(this.id);

        const accounts = await Account.forApp(this);

        for (const account of accounts)
        {
            await account.delete();
        }
    }

    static withUrl = async (url: string): Promise<App | null> =>
    {
        const result = (await db.collection("apps").where("url", "==", url).limit(1).get());

        if (result.empty) return null;

        const app = result.docs[0];

        return App.retrieve(app.id);
    }

    static exists = async (id: string): Promise<boolean> => (await App.retrieve(id)) !== null;

    public async isOwnedBy(user: User): Promise<boolean>
    {
        return this.data.owner === user.id;
    }
}