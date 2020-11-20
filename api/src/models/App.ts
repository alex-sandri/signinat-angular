import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

import { ApiRequest } from "../typings/ApiRequest";
import { Account } from "./Account";
import { ApiError } from "./ApiError";
import { ISerializedScope, Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

const db = firestore();

interface IApp
{
    name: string,
    url: string,
    owner: string,
    api: {
        key: string,
        webhook: string,
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
        webhook: string,
    },
    scopes: ISerializedScope[],
}

export class App
{
    private constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly url: string,
        public readonly owner: User,
        public readonly apiKey: string,
        public readonly webhook: string,
        public readonly scopes: Scope[],
    ) {}

    public json = (): ISerializedApp =>
    ({
        id: this.id,
        name: this.name,
        url: this.url,
        owner: this.owner.json(),
        api: {
            key: this.apiKey,
            webhook: this.webhook,
        },
        scopes: this.scopes.map(scope => scope.json()),
    });

    public static from = (json: ISerializedApp): App =>
    {
        return new App(
            json.id,
            json.name,
            json.url,
            User.from(json.owner),
            json.api.key,
            json.api.webhook,
            Scope.from(json.scopes.map(scope => scope.value)),
        );
    }

    static create = async (user: User, data: ApiRequest.Apps.Create): Promise<App> =>
    {
        App.validate(data);

        if ((await App.withUrl(data.url)) !== null) throw new ApiError("app/url/already-exists");

        const apiKey = uuidv4();

        const app = await db.collection("apps").add(<IApp>{
            name: data.name,
            url: data.url,
            owner: user.id,
            api: {
                key: apiKey,
            },
        });

        await Scope.set(app.id, Scope.from(data.scopes));

        return new App(
            app.id,
            data.name,
            data.url,
            user,
            apiKey,
            "", // TODO,
            Scope.from(data.scopes),
        );
    }

    static retrieve = async (id: string): Promise<App | null> =>
    {
        const app = await db.collection("apps").doc(id).get();

        if (!app.exists) return null;

        const data = app.data() as IApp;

        const owner = await User.retrieve(data.owner) as User;

        const scopes = await Scope.list(app.id);

        return new App(
            id,
            data.name,
            data.url,
            owner,
            data.api.key,
            data.api.webhook,
            scopes,
        );
    }

    static list = async (user: User): Promise<App[]> =>
    {
        const snapshot = await db.collection("apps").where("owner", "==", user.id).get();

        const apps: App[] = [];

        snapshot.docs.forEach(app =>
        {
            const data = app.data() as IApp;

            apps.push(new App(
                app.id,
                data.name,
                data.url,
                user,
                data.api.key,
                data.api.webhook,
                [], // Scopes are not sent with a LIST operation
            ));
        });

        return apps;
    }

    public update = async (data: ApiRequest.Apps.Update): Promise<void> =>
    {
        await db.collection("apps").doc(this.id).update({
            "api.webhook": data.api.webhook,
        });
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

    static isOwnedBy = async (id: string, user: User): Promise<boolean> =>
    {
        const app = await App.retrieve(id);

        if (!app) return false;

        return app.owner.id === user.id;
    }

    /**
     * @throws `Error` if data is not valid
     */
    static validate = (data: ApiRequest.Apps.Create): void =>
    {
        if (data.name.length === 0) throw new ApiError("app/name/empty");

        if (data.url.length === 0) throw new ApiError("app/url/empty");
    }
}