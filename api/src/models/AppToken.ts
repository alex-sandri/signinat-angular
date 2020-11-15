import { firestore } from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

import { App } from "./App";
import { User } from "./User";

const db = firestore();

interface IAppToken
{
    app: string,
    user: string,
}

export class AppToken
{
    constructor(
        public readonly app: App,
        public readonly user: User,
    ) {}

    public static async create(app: string, user: string): Promise<string>
    {
        const uuid = uuidv4();

        await db.collection("tokens").doc(uuid).set(<IAppToken>{
            app,
            user,
        });

        return uuid;
    }

    public static async retrieve(token?: string): Promise<AppToken | null>
    {
        if (!token) return null;

        const snapshot = await db.collection("tokens").doc(token).get();

        if (!snapshot.exists) return null;

        const data = snapshot.data() as IAppToken;

        const app = await App.retrieve(data.app);

        if (!app) return null;

        const user = await User.retrieve(data.user);

        if (!user) return null;

        // TODO
        // Filter data based on permission level

        return new AppToken(
            app,
            user,
        );
    }
}