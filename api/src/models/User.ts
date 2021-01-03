import { firestore } from "firebase-admin";
import PhoneNumber from "awesome-phonenumber";

import { Scope } from "./Scope";
import { Account } from "./Account";
import { App } from "./App";
import { IUser, Validator } from "../utilities/Validator";
import Utilities from "../utilities/Utilities";

const db = firestore();

interface IDatabaseUser
{
    name: {
        first: string,
        last: string,
    },
    email: string,
    password: string,
    birthday?: string,
    tel?: string,
}

export interface ISerializedUser
{
    id: string,
    name: {
        first: string,
        last: string,
    },
    email: string,
    birthday?: {
        day: number,
        month: number,
        year: number,
    },
    tel?: {
        prefix: string,
        number: string,
    },
}

export class User
{
    private constructor(public readonly id: string, public readonly data: IDatabaseUser)
    {}

    public json = (): ISerializedUser =>
    {
        const json: ISerializedUser = {
            id: this.id,
            name: {
                first: this.data.name.first,
                last: this.data.name.last,
            },
            email: this.data.email,
        };

        if (!Utilities.isNullOrUndefined(this.data.birthday))
        {
            const birthday = new Date(this.data.birthday);;

            json.birthday = {
                day: birthday.getDate(),
                month: birthday.getMonth() + 1,
                year: birthday.getFullYear(),
            };
        }

        if (!Utilities.isNullOrUndefined(this.data.tel))
        {
            const phoneNumber = new PhoneNumber(this.data.tel);

            json.tel = {
                prefix: `+${phoneNumber.getCountryCode()}`,
                number: phoneNumber.getNumber(),
            };
        }

        return json;
    };

    public filter = (scopes: Scope[]): User =>
    {
        const filteredUser = this.data;

        if (!scopes.some(scope => scope.canAccess("user.profile.name.first")))
        {
            filteredUser.name.first = "";
        }

        if (!scopes.some(scope => scope.canAccess("user.profile.name.last")))
        {
            filteredUser.name.last = "";
        }

        if (!scopes.some(scope => scope.canAccess("user.profile.email")))
        {
            filteredUser.email = "";
        }

        if (!scopes.some(scope => scope.canAccess("user.profile.birthday")))
        {
            filteredUser.birthday = undefined;
        }

        return new User(this.id, filteredUser);
    }

    static create = async (data: IUser): Promise<User> =>
    {
        const result = await Validator.of("create").user(data);

        if (!result.valid)
        {
            throw result;
        }

        const user: IDatabaseUser = {
            name: {
                first: data.name!.first!.trim(),
                last: data.name!.last!.trim(),
            },
            email: data.email!.trim(),
            password: Utilities.hash(data.password!),
            birthday: data.birthday,
        };

        const { id } = await db.collection("users").add(user);

        return new User(id, user);
    }

    static retrieve = async (id: string): Promise<User | null> =>
    {
        const user = await db.collection("users").doc(id).get();

        if (!user.exists) return null;

        const data = user.data() as IDatabaseUser;

        return new User(id, data);
    }

    public update = async (data: IUser): Promise<void> =>
    {
        const result = await Validator.of("update").user(data, this.json());

        if (!result.valid)
        {
            throw result;
        }

        let password: string | undefined;

        if (!Utilities.isNullOrUndefined(data.password))
        {
            password = Utilities.hash(data.password);
        }

        this.data.name.first = data.name?.first ?? this.data.name.first;
        this.data.name.last = data.name?.last ?? this.data.name.last;
        this.data.email = data.email ?? this.data.email;
        this.data.password = password ?? this.data.password;
        this.data.birthday = data.birthday ?? this.data.birthday;

        if (data.tel)
        {
            const pn = new PhoneNumber(data.tel);
        }

        await db.collection("users").doc(this.id).update(this.data);
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