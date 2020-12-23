import { firestore } from "firebase-admin";
import * as bcrypt from "bcrypt";
import * as dayjs from "dayjs";

import { Scope } from "./Scope";
import { Account } from "./Account";
import { App } from "./App";
import { IUser, Validator, ValidatorConstants } from "../utilities/Validator";
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
    birthday?: {
        day: number,
        month: number,
        year: number,
    },
}

export class User
{
    private constructor(public readonly id: string, public readonly data: IDatabaseUser)
    {}

    public json = (): ISerializedUser =>
    {
        const birthdayAsDate = this.data.birthday?.toDate();

        return {
            id: this.id,
            name: {
                first: this.data.name.first,
                last: this.data.name.last,
            },
            email: this.data.email,
            password: this.data.password,
            birthday: birthdayAsDate && {
                day: birthdayAsDate.getDate(),
                month: birthdayAsDate.getMonth() + 1,
                year: birthdayAsDate.getFullYear(),
            },
        };
    };

    public static from = (json: ISerializedUser): User =>
    {
        let birthday;

        if (!Utilities.isNullOrUndefined(json.birthday))
        {
            birthday = new Date();

            birthday.setDate(json.birthday.day);
            birthday.setMonth(json.birthday.month);
            birthday.setFullYear(json.birthday.year);
        }

        return new User(json.id, {
            name: {
                first: json.name.first,
                last: json.name.last,
            },
            email: json.email,
            password: json.password,
            birthday: birthday && firestore.Timestamp.fromDate(birthday),
        });
    }

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

        data.password = bcrypt.hashSync(data.password, 15);

        const user: IDatabaseUser = {
            name: {
                first: data.name!.first!.trim(),
                last: data.name!.last!.trim(),
            },
            email: data.email!.trim(),
            password: data.password,
            birthday: data.birthday ? firestore.Timestamp.fromDate(new Date(data.birthday)) : undefined,
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

        const updatedUser = this.data;

        if (!Utilities.isNullOrUndefined(data.name))
        {
            if (!Utilities.isNullOrUndefined(data.name.first))
            {
                updatedUser.name.first = data.name.first;
            }

            if (!Utilities.isNullOrUndefined(data.name.last))
            {
                updatedUser.name.last = data.name.last;
            }
        }

        if (!Utilities.isNullOrUndefined(data.email))
        {
            updatedUser.email = data.email;
        }

        if (!Utilities.isNullOrUndefined(data.birthday))
        {
            updatedUser.birthday = firestore.Timestamp.fromDate(
                dayjs(data.birthday, ValidatorConstants.BIRTHDAY_FORMAT).toDate()
            );
        }

        await db.collection("users").doc(this.id).update(updatedUser);
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