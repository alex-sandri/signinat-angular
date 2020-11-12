import { firestore } from "firebase-admin";

import { ApiError } from "./ApiError";
import { App, ISerializedApp } from "./App";
import { Session } from "./Session";

const db = firestore();

interface IAccount
{
    app: string,
}

export interface ISerializedAccount
{
    id: string,
    app: ISerializedApp,
}

export class Account
{
    private constructor(
        private readonly id: string,
        private readonly app: App,
    ) {}

    public json = (): ISerializedAccount =>
    ({
        id: this.id,
        app: this.app.json(),
    });

    static create = async (session: Session, id: string): Promise<Account> =>
    {
        if (!(await App.exists(id))) throw new ApiError("app/inexistent");

        if ((await Account.withAppId(session, id)) !== null) throw new ApiError("account/already-exists");

        const account = await db.collection(`users/${session.user.id}/accounts`).add(<IAccount>{
            app: id,
        });

        return new Account(
            account.id,
            await App.retrieve(id) as App,
        );
    }

    static retrieve = async (session: Session, id: string): Promise<Account | null> =>
    {
        const account = await db.collection(`users/${session.user.id}/accounts`).doc(id).get();

        if (!account.exists) return null;

        const data = account.data() as IAccount;

        return new Account(
            id,
            await App.retrieve(data.app) as App,
        );
    }

    static list = async (session: Session): Promise<Account[]> =>
    {
        const snapshot = await db.collection(`users/${session.user.id}/accounts`).get();

        const accounts: Account[] = [];

        for (const account of snapshot.docs)
        {
            const data = account.data() as IAccount;

            accounts.push(new Account(
                account.id,
                await App.retrieve(data.app) as App,
            ));
        }

        return accounts;
    }

    static unlink = async (session: Session, id: string): Promise<void> => { await db.collection(`users/${session.user.id}/accounts`).doc(id).delete(); }

    static delete = async (session: Session, id: string): Promise<void> =>
    {
        // TODO
        // Send POST request to App webhook to request the account deletion

        // TODO
        // if successful
        await Account.unlink(session, id);
    }

    static withAppId = async (session: Session, app: string): Promise<Account | null> =>
    {
        const result = await db.collection(`users/${session.user.id}/accounts`).where("app", "==", app).limit(1).get();

        if (result.empty) return null;

        const account = result.docs[0];

        return Account.retrieve(session, account.id);
    }

    static exists = async (session: Session, id: string): Promise<boolean> => (await Account.retrieve(session, id)) !== null;
}