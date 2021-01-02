import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { IAppToken, IUserToken, Validator } from "../utilities/Validator";

import { App, ISerializedApp } from "./App";
import { ISerializedScope, Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

const db = firestore();

export type TAuthTokenType = "user" | "app";

interface IAuthToken
{
    user: string,

    app?: string,
    scopes?: string[],
}

export interface ISerializedAuthToken
{
    id: string,
    user: ISerializedUser,

    app?: ISerializedApp,
    scopes?: ISerializedScope[],
}

export class AuthToken
{
    private constructor(
        public readonly id: string,
        public readonly type: TAuthTokenType,
        public readonly user: User,

        public readonly app?: App,
        public readonly scopes?: Scope[],
    ) {}

    public async json(): Promise<ISerializedAuthToken>
    {
        return {
            id: this.id,
            user: this.user.json(),
    
            app: await this.app?.json(),
            scopes: this.scopes?.map(scope => scope.json()),
        };
    }

    public static async app(token: IAppToken, user: User): Promise<AuthToken>
    {
        const result = await Validator.of("create").token(token, "app");

        if (!result.valid)
        {
            throw result;
        }

        const app = await App.retrieve(token.app!) as App;

        const uuid = uuidv4();

        await db.collection("tokens").doc(uuid).set(<IAuthToken>{
            app: app.id,
            user: user.id,
            scopes: app.data.scopes,
        });

        return new AuthToken(
            uuid,
            "app",
            user,
            app,
            Scope.from(app.data.scopes),
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

        let app: App | undefined;

        let scopes: Scope[];

        if (!user) return null;

        if (data.app)
        {
            type = "app";

            app = await App.retrieve(data.app) ?? undefined;

            if (!app) return null;

            scopes = Scope.from(data.scopes!);
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
            scopes,
        );
    }

    public delete = async (): Promise<void> =>
    {
        await db.collection("tokens").doc(this.id).delete();
    }
}