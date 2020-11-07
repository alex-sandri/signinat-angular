import { firestore } from "firebase-admin";
import * as bcrypt from "bcrypt";

import { ApiRequest } from "../typings/ApiRequest";
import { ISerializedUser, User } from "./User";
import { ApiError } from "./ApiError";

const db = firestore();

interface ISession
{
    expires: firestore.Timestamp,
}

export interface ISerializedSession
{
    id: string,
    expires: string,
    user: ISerializedUser,
    token: string,
}

export class Session
{
    private constructor(
        public id: string,
        public expires: Date,
        public user: User,
    ) {}

    public json = (): ISerializedSession =>
    ({
        id: this.id,
        expires: this.expires.toISOString(),
        user: this.user.json(),
        token: `${this.user.id};${this.id}`,
    });

    static create = async (data: ApiRequest.Sessions.Create): Promise<Session> =>
    {
        Session.validate(data);

        const user = await User.withEmail(data.email);

        if (!user) throw new ApiError("user/email/inexistent");

        if (!bcrypt.compareSync(data.password, user.password)) throw new ApiError("user/password/wrong");

        const expires = firestore.Timestamp.now();

        const session = await db.collection(`users/${user.id}/sessions`).add(<ISession>{
            expires,
        });

        return new Session(
            session.id,
            expires.toDate(),
            user,
        );
    }

    static retrieve = async (user: User, id: string): Promise<Session | null> =>
    {
        const session = await db.collection(`users/${user.id}/sessions`).doc(id).get();

        if (!session.exists) return null;

        const data = session.data() as ISession;

        return new Session(
            session.id,
            data.expires.toDate(),
            user,
        );
    }

    static withToken = async (token: string): Promise<Session | null> =>
    {
        const user = await User.retrieve(token.split(";")[0]);

        if (!user) return null;

        return Session.retrieve(user, token.split(";")[1]);
    }

    public delete = async (): Promise<void> => { await db.collection(`users/${this.user.id}/sessions`).doc(this.id).delete(); }

    static exists = async (user: User, id: string): Promise<boolean> => (await Session.retrieve(user, id)) !== null;

    /**
     * @throws `Error` if data is not valid
     */
    static validate = (data: ApiRequest.Sessions.Create): void =>
    {
        if (data.email.length === 0) throw new ApiError("user/email/empty");

        if (data.password.length === 0) throw new ApiError("user/password/empty");
    }
}