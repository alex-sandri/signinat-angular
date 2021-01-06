import { firestore } from "firebase-admin";

import { IApp, Validator } from "../utilities/Validator";
import { ISerializedScope, Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

const db = firestore();

interface IDatabaseApp
{
    name: string,
    url: string,
    owner: string,
    scopes: string[],
}

export interface ISerializedApp
{
    id: string,
    name: string,
    url: string,
    owner: ISerializedUser,
    scopes: ISerializedScope[],
}

export class App
{
    private constructor(
        public readonly id: string,
        public readonly data: IDatabaseApp,
        public readonly owner: User,
    )
    {}

    public json(): ISerializedApp
    {
        return {
            id: this.id,
            name: this.data.name,
            url: this.data.url,
            owner: this.owner.json(),
            scopes: Scope.from(this.data.scopes).map(scope => scope.json()),
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
            scopes: Scope.filterUnnecessary(data.scopes!),
        };

        const { id } = await db.collection("apps").add(app);

        return new App(id, app, user);
    }

    static retrieve = async (id: string): Promise<App | null> =>
    {
        const app = await db.collection("apps").doc(id).get();

        if (!app.exists) return null;

        const data = app.data() as IDatabaseApp;

        const owner = await User.retrieve(data.owner) as User;

        return new App(id, data, owner);
    }

    static list = async (user: User): Promise<App[]> =>
    {
        const snapshot = await db.collection("apps").where("owner", "==", user.id).get();

        const apps: App[] = [];

        snapshot.docs.forEach(app =>
        {
            const data = app.data() as IDatabaseApp;

            apps.push(new App(app.id, data, user));
        });

        return apps;
    }

    public update = async (data: IApp): Promise<void> =>
    {
        const result = await Validator.of("update").app(data, this.json());

        if (!result.valid)
        {
            throw result;
        }

        this.data.name = data.name ?? this.data.name;
        this.data.url = data.url ?? this.data.url;
        this.data.scopes = data.scopes ?? this.data.scopes;

        await db.collection("apps").doc(this.id).update(this.data);
    }

    public delete = async (): Promise<void> =>
    {
        await db.collection("apps").doc(this.id).delete();
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