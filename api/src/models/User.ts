import { firestore } from "firebase-admin";
import * as bcrypt from "bcrypt";

import { ApiRequest } from "../typings/ApiRequest";
import { ApiError } from "./ApiError";
import { Scope } from "./Scope";

const db = firestore();

interface IUser
{
    name: {
        first: string,
        last: string,
    },
    email: string,
    password: string,
}

export interface ISerializedUser
{
    id: string,
    name: {
        first: string,
        last: string,
    },
    email: string,
}

export class User
{
    private constructor(
        public readonly id: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly password: string,
    ) {}

    public json = (): ISerializedUser =>
    ({
        id: this.id,
        name: {
            first: this.firstName,
            last: this.lastName,
        },
        email: this.email,
    });

    public filter = (scopes: Scope[]): User =>
    {
        let firstName = this.firstName;
        let lastName = this.lastName;
        let email = this.email;

        if (!scopes.some(scope => scope.canAccess("user.profile.name.first")))
        {
            firstName = "";
        }

        if (!scopes.some(scope => scope.canAccess("user.profile.name.last")))
        {
            lastName = "";
        }

        if (!scopes.some(scope => scope.canAccess("user.profile.email")))
        {
            email = "";
        }

        return new User(
            this.id,
            firstName,
            lastName,
            email,
            "", // Remove password from filtered user
        );
    }

    static create = async (data: ApiRequest.Users.Create): Promise<User> =>
    {
        User.validate(data);

        if (await User.exists(data.email)) throw new ApiError("user/email/already-exists");

        data.password = bcrypt.hashSync(data.password, 15);

        const user = await db.collection("users").add(<IUser>data);

        return new User(
            user.id,
            data.name.first,
            data.name.last,
            data.email,
            data.password,
        );
    }

    static retrieve = async (id: string): Promise<User | null> =>
    {
        const user = await db.collection("users").doc(id).get();

        if (!user.exists) return null;

        const data = user.data() as IUser;

        return new User(
            id,
            data.name.first,
            data.name.last,
            data.email,
            data.password,
        );
    }

    static delete = async (id: string): Promise<void> =>
    {
        await db.collection("users").doc(id).delete();

        // TODO
        // Delete accounts collection
    }

    static withEmail = async (email: string): Promise<User | null> =>
    {
        const result = (await db.collection("users").where("email", "==", email).limit(1).get());

        if (result.empty) return null;

        const user = result.docs[0];

        return User.retrieve(user.id);
    }

    static exists = async (email: string): Promise<boolean> => (await User.withEmail(email)) !== null;

    /**
     * @throws `Error` if data is not valid
     */
    static validate = (data: ApiRequest.Users.Create): void =>
    {
        if (data.name.first.length === 0) throw new ApiError("user/name/first/empty");

        if (data.name.last.length === 0) throw new ApiError("user/name/last/empty");

        if (data.email.length === 0) throw new ApiError("user/email/empty");

        if (data.password.length === 0) throw new ApiError("user/password/empty");
        else if (data.password.length < 8) throw new ApiError("user/password/weak");
    }
}