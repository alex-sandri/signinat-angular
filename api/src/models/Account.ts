import { firestore } from "firebase-admin";

import { ApiError } from "./ApiError";
import { App, ISerializedApp } from "./App";
import { ISerializedUser, User } from "./User";

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

    static create = async (user: User, id: string): Promise<Account> =>
    {
        if (!(await App.exists(id))) throw new ApiError("app/inexistent");

        if ((await Account.withAppId(user, id)) !== null) throw new ApiError("account/already-exists");

        const account = await db.collection("accounts").add(<IAccount>{
            app: id,
            user: user.id,
        });

        return new Account(
            account.id,
            await App.retrieve(id) as App,
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

    static unlink = async (id: string): Promise<void> => { await db.collection("accounts").doc(id).delete(); }

    public delete = async (): Promise<void> =>
    {
        // TODO
        // Send POST request to App webhook to request the account deletion

        // TODO
        // if successful
        await Account.unlink(this.id);
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