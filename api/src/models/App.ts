import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

import { ApiRequest } from "../typings/ApiRequest";
import { ApiError } from "./ApiError";
import { ISerializedScope, Scope } from "./Scope";
import { Session } from "./Session";
import { ISerializedUser, User } from "./User";

const db = firestore();

interface IApp
{
    name: string,
    url: string,
    owner: string,
    api: {
        key: string,
    },
}

export interface ISerializedApp
{
    id: string,
    name: string,
    url: string,
    owner: ISerializedUser,
    api: {
        key: string,
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
        },
        scopes: this.scopes.map(scope => scope.json()),
    });

    static create = async (session: Session, data: ApiRequest.Apps.Create): Promise<App> =>
    {
        App.validate(data);

        if (await App.exists(data.url)) throw new ApiError("app/url/already-exists");

        const apiKey = uuidv4();

        const app = await db.collection("apps").add(<IApp>{
            name: data.name,
            url: data.url,
            owner: session.user.id,
            api: {
                key: apiKey,
            },
        });

        await Scope.set(app.id, data.scopes);

        return new App(
            app.id,
            data.name,
            data.url,
            session.user,
            apiKey,
            [], // TODO
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
            scopes,
        );
    }

    static list = async (session: Session): Promise<App[]> =>
    {
        const snapshot = await db.collection("apps").where("owner", "==", session.user.id).get();

        const apps: App[] = [];

        snapshot.docs.forEach(app =>
        {
            const data = app.data() as IApp;

            apps.push(new App(
                app.id,
                data.name,
                data.url,
                session.user,
                data.api.key,
                [], // Fields are not sent with a LIST operation
            ));
        });

        return apps;
    }

    static delete = async (id: string): Promise<void> =>
    {
        await db.collection("apps").doc(id).delete();

        // TODO
        // Delete every account associated with this app
    }

    static withUrl = async (url: string): Promise<App | null> =>
    {
        const result = (await db.collection("apps").where("url", "==", url).limit(1).get());

        if (result.empty) return null;

        const app = result.docs[0];

        return App.retrieve(app.id);
    }

    static exists = async (url: string): Promise<boolean> => (await App.withUrl(url)) !== null;

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