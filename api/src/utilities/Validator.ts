import * as dayjs from "dayjs";

import { ApiError, ISerializedApiError, TApiErrorType } from "../models/ApiError";
import { User } from "../models/User";

dayjs.extend(require("dayjs/plugin/customParseFormat"));

type TValidatorType = "create" | "update";

interface IUser
{
    name?: {
        first?: string,
        last?: string,
    },
    email?: string,
    password?: string,
    birthday?: string,
}

interface ISerializedValidatorResult
{
    valid: boolean,
    errors: ISerializedApiError[],
}

export class Validator
{
    private constructor(private type: TValidatorType)
    {}

    public static of(type: TValidatorType): Validator
    {
        return new Validator(type);
    }

    /**
     * Validates a user object
     * 
     * @param user The user object to validate
     * 
     * @returns `Promise<ValidatorResult>` Validation success
     */
    public async user(user?: IUser): Promise<ValidatorResult>
    {
        let result = new ValidatorResult();

        if (!user)
        {
            result.add("user/required");

            return result;
        }

        if (user.birthday)
        {
            if (user.birthday.length === 0) result.add("user/birthday/empty");
            else if (typeof user.birthday !== "string") result.add("user/birthday/invalid");
            else if (!dayjs(user.birthday, "YYYY-MM-DD")) result.add("user/birthday/invalid");
        }

        switch (this.type)
        {
            case "create":
                if (!user.name) result.add("user/name/required");
                else
                {
                    if (!user.name.first) result.add("user/name/first/required");
                    else if (typeof user.name.first !== "string") result.add("user/name/first/invalid");
                    else if (user.name.first.length === 0) result.add("user/name/first/empty");

                    if (!user.name.last) result.add("user/name/last/required");
                    else if (typeof user.name.last !== "string") result.add("user/name/last/invalid");
                    else if (user.name.last.length === 0) result.add("user/name/last/empty");
                }

                if (!user.email) result.add("user/email/required");
                else if (typeof user.email !== "string") result.add("user/email/invalid");
                else if (user.email.length === 0) result.add("user/email/empty");
                else if (await User.exists(user.email)) result.add("user/email/already-exists");

                if (!user.password) result.add("user/password/required");
                else if (typeof user.password !== "string") result.add("user/password/invalid");
                else if (user.password.length === 0) result.add("user/password/empty");
                else if (user.password.length < 8) result.add("user/password/weak");
                break;
            case "update":
                // TODO: Add else case for invalid types

                if (typeof user.name?.first === "string")
                {
                    if (user.name.first.length === 0) result.add("user/name/first/empty");
                }

                if (typeof user.name?.last === "string")
                {
                    if (user.name.last.length === 0) result.add("user/name/last/empty");
                }

                if (typeof user.email === "string")
                {
                    if (user.email.length === 0) result.add("user/email/empty");
                    else if (await User.exists(user.email)) result.add("user/email/already-exists");
                }

                if (typeof user.password === "string")
                {
                    if (user.password.length === 0) result.add("user/password/empty");
                    else if (user.password.length < 8) result.add("user/password/weak");
                }
                break;
        }

        return result;
    }
}

export class ValidatorResult
{
    public readonly errors: Set<TApiErrorType> = new Set();

    public get valid()
    {
        return this.errors.size === 0;
    };

    public add(error: TApiErrorType): void
    {
        this.errors.add(error);
    }

    public json(): ISerializedValidatorResult
    {
        return {
            valid: this.valid,
            errors: Array.from(this.errors).map(error => new ApiError(error).json()),
        };
    }
}