import { firestore } from "firebase-admin";
import * as bcrypt from "bcrypt";

import { ApiRequest } from "../typings/ApiRequest";
import { Scope } from "./Scope";
import { Account } from "./Account";
import { App } from "./App";
import { Validator } from "../utilities/Validator";

const db = firestore();

interface IUser
{
    name: {
        first: string,
        last: string,
    },
    email: string,
    password: string,
    birthday?: firestore.Timestamp
}

export interface ISerializedUser
{
    id: string,
    name: {
        first: string,
        last: string,
    },
    email: string,
    password: string,
    birthday?: Date,
}

export class User
{
    private constructor(
        public readonly id: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly email: string,
        public readonly password: string,
        public readonly birthday?: Date,
    ) {}

    public json = (): ISerializedUser =>
    ({
        id: this.id,
        name: {
            first: this.firstName,
            last: this.lastName,
        },
        email: this.email,
        password: this.password,
        birthday: this.birthday,
    });

    public static from = (json: ISerializedUser): User =>
    {
        return new User(
            json.id,
            json.name.first,
            json.name.last,
            json.email,
            json.password,
            json.birthday,
        );
    }

    public filter = (scopes: Scope[]): User =>
    {
        let firstName = this.firstName;
        let lastName = this.lastName;
        let email = this.email;
        let birthday = this.birthday;

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

        if (!scopes.some(scope => scope.canAccess("user.profile.birthday")))
        {
            birthday = undefined;
        }

        return new User(
            this.id,
            firstName,
            lastName,
            email,
            "", // Remove password from filtered user
            birthday,
        );
    }

    static create = async (data: ApiRequest.Users.Create): Promise<User> =>
    {
        const result = await Validator.of("create").user(data);

        if (!result.valid)
        {
            throw result;
        }

        data.password = bcrypt.hashSync(data.password, 15);

        const user = await db.collection("users").add(<IUser>{
            name: {
                first: data.name.first.trim(),
                last: data.name.last.trim(),
            },
            email: data.email.trim(),
            password: data.password,
            birthday: data.birthday ? firestore.Timestamp.fromDate(new Date(data.birthday)) : undefined,
        });

        return new User(
            user.id,
            data.name.first,
            data.name.last,
            data.email,
            data.password,
            data.birthday ? new Date(data.birthday) : undefined,
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
            data.birthday ? data.birthday.toDate() : undefined,
        );
    }

    public update = async (data: ApiRequest.Users.Update): Promise<void> =>
    {
        const result = await Validator.of("update").user(data);

        if (!result.valid)
        {
            throw result;
        }

        const firstName: string = data.name?.first ?? this.firstName;
        const lastName: string = data.name?.last ?? this.lastName;
        const email: string = data.email ?? this.email;
        const birthday: string | undefined = data.birthday ?? this.birthday?.toDateString();

        await db.collection("apps").doc(this.id).update({
            "name.first": firstName,
            "name.last": lastName,
            email,
            birthday,
        });
    }

    public delete = async (): Promise<void> =>
    {
        await db.collection("users").doc(this.id).delete();

        const apps = await App.list(this);

        for (const app of apps)
        {
            await app.delete();
        }

        const accounts = await Account.list(this);

        for (const account of accounts)
        {
            await account.delete();
        }
    }

    static withEmail = async (email: string): Promise<User | null> =>
    {
        const result = (await db.collection("users").where("email", "==", email).limit(1).get());

        if (result.empty) return null;

        const user = result.docs[0];

        return User.retrieve(user.id);
    }

    static exists = async (email: string): Promise<boolean> => (await User.withEmail(email)) !== null;
}