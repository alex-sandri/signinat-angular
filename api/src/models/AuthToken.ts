import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { IAppToken, IUserToken, Validator } from "../utilities/Validator";

import { App, ISerializedApp } from "./App";
import { Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

const db = firestore();

export type TAuthTokenType = "user" | "app";

interface IAuthToken
{
    user: string,

    app?: string,
}

export interface ISerializedAuthToken
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

    public async json(): Promise<ISerializedAuthToken>
    {
        return {
            id: this.id,
            user: this.user.json(),
    
            app: await this.app?.json(),
        };
    }

    public static async app(token: IAppToken): Promise<AuthToken>
    {
        const result = await Validator.of("create").token(token, "app");

        if (!result.valid)
        {
            throw result;
        }

        const user = await User.retrieve(token.user!) as User;

        const app = await App.retrieve(token.app!) as App;

        const uuid = uuidv4();

        await db.collection("tokens").doc(uuid).set(<IAuthToken>{
            app: app.id,
            user: user.id,
        });

        return new AuthToken(
            uuid,
            "app",
            user,
            app,
        );
    }

    public static async user(token: IUserToken): Promise<AuthToken>
    {
        const result = await Validator.of("create").token(token, "user");

        if (!result.valid)
        {
            throw result;
        }

        const user = await User.withEmail(token.email!) as User;

        const uuid = uuidv4();

        await db.collection("tokens").doc(uuid).set(<IAuthToken>{ user: user.id });

        return new AuthToken(
            uuid,
            "user",
            user,
        );
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

    public delete = async (): Promise<void> =>
    {
        await db.collection("tokens").doc(this.id).delete();
    }
}