import * as dayjs from "dayjs";

import { ApiError, ISerializedApiError, TApiErrorType } from "../models/ApiError";
import { ISerializedApp } from "../models/App";
import { ISerializedUser, User } from "../models/User";
import Utilities from "./Utilities";

dayjs.extend(require("dayjs/plugin/customParseFormat"));

type TValidatorType = "create" | "update";

export interface IUser
{
    name?: {
        first?: string,
        last?: string,
    },
    email?: string,
    password?: string,
    birthday?: string,
}

export interface IApp
{
    name?: string,
    url?: string,
    owner?: string,
    api?: {
        key?: string,
        webhook?: {
            url?: string,
            signature?: string,
        },
    },
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
     * @param old The old user (required only when type is `update`)
     * 
     * @returns `Promise<ValidatorResult>` Validation success
     */
    public async user(user?: IUser, old?: ISerializedUser): Promise<ValidatorResult>
    {
        let result = new ValidatorResult();

        if (Utilities.isNullOrUndefined(user))
        {
            result.add("user/required");

            return result;
        }

        if (!Utilities.isNullOrUndefined(user.birthday))
        {
            if (Utilities.isEmpty(user.birthday)) result.add("user/birthday/empty");
            else if (!Utilities.isString(user.birthday)) result.add("user/birthday/invalid");
            else if (!dayjs(user.birthday, ValidatorConstants.BIRTHDAY_FORMAT)) result.add("user/birthday/invalid");
        }

        switch (this.type)
        {
            case "create":
                if (!user.name) result.add("user/name/required");
                else
                {
                    if (!user.name.first) result.add("user/name/first/required");
                    else if (!Utilities.isString(user.name.first)) result.add("user/name/first/invalid");
                    else if (Utilities.isEmpty(user.name.first)) result.add("user/name/first/empty");

                    if (!user.name.last) result.add("user/name/last/required");
                    else if (!Utilities.isString(user.name.last)) result.add("user/name/last/invalid");
                    else if (Utilities.isEmpty(user.name.last)) result.add("user/name/last/empty");
                }

                if (!user.email) result.add("user/email/required");
                else if (!Utilities.isString(user.email)) result.add("user/email/invalid");
                else if (Utilities.isEmpty(user.email)) result.add("user/email/empty");
                else if (await User.exists(user.email)) result.add("user/email/already-exists");

                if (!user.password) result.add("user/password/required");
                else if (!Utilities.isString(user.password)) result.add("user/password/invalid");
                else if (Utilities.isEmpty(user.password)) result.add("user/password/empty");
                else if (user.password.length < ValidatorConstants.PASSWORD_MIN_LENGTH) result.add("user/password/weak");
                break;
            case "update":
                // TODO: Add else case for invalid types

                if (Utilities.isNullOrUndefined(old))
                {
                    result.add("user/required");

                    return result;
                }

                if (!Utilities.isNullOrUndefined(user.name))
                {
                    if (Utilities.isString(user.name.first))
                    {
                        if (Utilities.isEmpty(user.name.first)) result.add("user/name/first/empty");
                    }

                    if (Utilities.isString(user.name.last))
                    {
                        if (Utilities.isEmpty(user.name.last)) result.add("user/name/last/empty");
                    }
                }

                if (Utilities.isString(user.email))
                {
                    if (Utilities.isEmpty(user.email)) result.add("user/email/empty");
                    else if (user.email !== old.email && await User.exists(user.email)) result.add("user/email/already-exists");
                }

                if (Utilities.isString(user.password))
                {
                    if (Utilities.isEmpty(user.password)) result.add("user/password/empty");
                    else if (user.password.length < ValidatorConstants.PASSWORD_MIN_LENGTH) result.add("user/password/weak");
                }
                break;
        }

        return result;
    }

    /**
     * Validates an app object
     * 
     * @param app The app object to validate
     * @param old The old app (required only when type is `update`)
     * 
     * @returns `Promise<ValidatorResult>` Validation success
     */
    public async app(app?: IApp, old?: ISerializedApp): Promise<ValidatorResult>
    {
        /*
        if (app.name.length === 0) throw new ApiError("app/name/empty");

        if (app.url.length === 0) throw new ApiError("app/url/empty");
        if ((await App.withUrl(data.url)) !== null) throw new ApiError("app/url/already-exists");
        */

        let result = new ValidatorResult();

        if (Utilities.isNullOrUndefined(app))
        {
            result.add("app/required");

            return result;
        }

        switch (this.type)
        {
            case "create":
                // TODO
            case "update":
                // TODO
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

export class ValidatorConstants
{
    public static readonly PASSWORD_MIN_LENGTH = 8;
    public static readonly BIRTHDAY_FORMAT = "YYYY-MM-DD";
}