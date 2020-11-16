import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

import { App, ISerializedApp } from "./App";
import { Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

const db = firestore();

type TAuthTokenType = "user" | "app";

interface IAuthToken
{
    user: string,

    app?: string,
}

interface ISerializedAuthToken
{
    id: string,
    user: ISerializedUser,

    app?: ISerializedApp,
}

export class AuthToken
{
    private constructor(
        public readonly id: string,
        public readonly type: TAuthTokenType,
        public readonly user: User,

        public readonly app?: App | null,
    ) {}

    public json = (): ISerializedAuthToken =>
    ({
        id: this.id,
        user: this.user.json(),

        app: this.app?.json(),
    });

    public static async create(app: string, user: string): Promise<string>
    {
        const uuid = uuidv4();

        await db.collection("tokens").doc(uuid).set(<IAuthToken>{
            app,
            user,
        });

        return uuid;
    }

    public static async retrieve(id?: string): Promise<AuthToken | null>
    {
        let type: TAuthTokenType;

        if (!id) return null;

        const snapshot = await db.collection("tokens").doc(id).get();

        if (!snapshot.exists) return null;

        const data = snapshot.data() as IAuthToken;

        const user = await User.retrieve(data.user);

        let app: App | null = null;

        let scopes: Scope[];

        if (!user) return null;

        if (data.app)
        {
            type = "app";

            app = await App.retrieve(data.app);

            if (!app) return null;

            scopes = app.scopes;
        }
        else
        {
            type = "user";

            scopes = [ Scope.ROOT ];
        }

        return new AuthToken(
            id,
            type,
            user.filter(scopes),

            app,
        );
    }
}