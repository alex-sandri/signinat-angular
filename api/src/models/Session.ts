import { firestore } from "firebase-admin";
import * as bcrypt from "bcrypt";

import { ApiRequest } from "../typings/ApiRequest";
import { ISerializedUser, User } from "./User";
import { ApiError } from "./ApiError";

const db = firestore();

interface ISession
{
    user: string
}

export interface ISerializedSession
{
    id: string,
    user: ISerializedUser,
}

export class Session
{
    private constructor(
        public id: string,
        public user: User,
    ) {}

    public json = (): ISerializedSession =>
    ({
        id: this.id,
        user: this.user.json(),
    });

    static create = async (data: ApiRequest.Sessions.Create): Promise<Session> =>
    {
        Session.validate(data);

        const user = await User.withEmail(data.email);

        if (!user) throw new ApiError("user/email/inexistent");

        if (!bcrypt.compareSync(data.password, user.password)) throw new ApiError("user/password/wrong");

        const session = await db.collection("sessions").add(<ISession>{
            user: user.id,
        });

        return new Session(
            session.id,
            user,
        );
    }

    static retrieve = async (id: string): Promise<Session | null> =>
    {
        const session = await db.collection("sessions").doc(id).get();

        if (!session.exists) return null;

        const data = session.data() as ISession;

        return new Session(
            session.id,
            (await User.retrieve(data.user)) as User,
        );
    }

    static delete = async (id: string): Promise<void> => { await db.collection("sessions").doc(id).delete(); }

    static exists = async (id: string): Promise<boolean> => (await Session.retrieve(id)) !== null;

    /**
     * @throws `Error` if data is not valid
     */
    static validate = (data: ApiRequest.Sessions.Create): void =>
    {
        if (data.email.length === 0) throw new ApiError("user/email/empty");

        if (data.password.length === 0) throw new ApiError("user/password/empty");
    }
}