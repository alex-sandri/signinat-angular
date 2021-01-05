import * as jwt from "jsonwebtoken";
import { IAppToken, IUserToken, Validator } from "../utilities/Validator";

import { App, ISerializedApp } from "./App";
import { ISerializedScope, Scope } from "./Scope";
import { ISerializedUser, User } from "./User";

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

export default class AuthToken
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

        const id = jwt.sign({ app: app.id, user: user.id, scopes: app.data.scopes }, process.env.TOKEN_SECRET!, { expiresIn: "30m" });

        return new AuthToken(
            id,
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

        const id = jwt.sign({ user: user.id }, process.env.TOKEN_SECRET!);

        return new AuthToken(
            id,
            "user",
            user,
        );
    }

    public static async retrieve(id?: string): Promise<AuthToken | null>
    {
        let type: TAuthTokenType;

        if (!id) return null;

        let token: string | object;

        try
        {
            token = jwt.verify(id, process.env.TOKEN_SECRET!);
        }
        catch (e)
        {
            return null;
        }

        const data = token as IAuthToken;

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
}