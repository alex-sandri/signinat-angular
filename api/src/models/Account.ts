import { firestore } from "firebase-admin";

import { ApiError } from "./ApiError";
import { App, ISerializedApp } from "./App";
import { ISerializedUser, User } from "./User";
import { Webhook } from "./Webhook";

const db = firestore();

interface IAccount
{
    app: string,
    user: string,
}

export interface ISerializedAccount
{
    id: string,
    app: ISerializedApp,
    user: ISerializedUser,
}

export class Account
{
    private constructor(
        public readonly id: string,
        public readonly app: App,
        public readonly user: User,
    ) {}

    public json = (): ISerializedAccount =>
    ({
        id: this.id,
        app: this.app.json(),
        user: this.user.json(),
    });

    static create = async (user: User, app: App): Promise<Account> =>
    {
        if ((await Account.withAppId(user, app.id)) !== null) throw new ApiError("account/already-exists");

        const account = await db.collection("accounts").add(<IAccount>{
            app: app.id,
            user: user.id,
        });

        await Webhook.send(
            app.json(),
            "user.created",
            {
                user: user.json(),
            },
        );

        return new Account(
            account.id,
            app,
            user,
        );
    }

    static retrieve = async (user: User, id: string): Promise<Account | null> =>
    {
        const account = await db.collection("accounts").doc(id).get();

        if (!account.exists) return null;

        const data = account.data() as IAccount;

        return new Account(
            id,
            await App.retrieve(data.app) as App,
            user,
        );
    }

    static list = async (user: User): Promise<Account[]> =>
    {
        const snapshot = await db.collection("accounts").where("user", "==", user.id).get();

        const accounts: Account[] = [];

        for (const account of snapshot.docs)
        {
            const data = account.data() as IAccount;

            accounts.push(new Account(
                account.id,
                await App.retrieve(data.app) as App,
                user,
            ));
        }

        return accounts;
    }

    static forApp = async (app: App): Promise<Account[]> =>
    {
        const snapshot = await db.collection("accounts").where("app", "==", app.id).get();

        const accounts: Account[] = [];

        for (const account of snapshot.docs)
        {
            const data = account.data() as IAccount;

            accounts.push(new Account(
                account.id,
                app,
                await User.retrieve(data.user) as User,
            ));
        }

        return accounts;
    }

    public unlink = async (): Promise<void> => { await db.collection("accounts").doc(this.id).delete(); }

    public delete = async (): Promise<void> =>
    {
        const success = await Webhook.send(
            this.app.json(),
            "user.deleted",
            {
                id: this.user.id,
            },
        );

        if (success)
        {
            await this.unlink();
        }
    }

    static withAppId = async (user: User, app: string): Promise<Account | null> =>
    {
        const result = await db
            .collection("accounts")
            .where("user", "==", user.id)
            .where("app", "==", app)
            .limit(1)
            .get();

        if (result.empty) return null;

        const account = result.docs[0];

        return Account.retrieve(user, account.id);
    }

    static exists = async (user: User, id: string): Promise<boolean> => (await Account.retrieve(user, id)) !== null;
}