import * as dayjs from "dayjs";

import { ApiError, ISerializedApiError, TApiError } from "../models/ApiError";
import { App, ISerializedApp } from "../models/App";
import { Scope } from "../models/Scope";
import { ISerializedUser, User } from "../models/User";
import Schema, { SchemaPresets, SchemaValidationResult } from "./Schema";
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
    scopes?: string[],
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
    public async app(app?: IApp, old?: ISerializedApp): Promise<SchemaValidationResult>
    {
        let result: SchemaValidationResult;

        switch (this.type)
        {
            case "create":
            {
                result = new Schema("app", {
                    name: SchemaPresets.NON_EMPTY_STRING,
                    url: SchemaPresets.URL,
                    scopes: {
                        type: "array",
                        of: {
                            type: "string",
                            required: true,
                            enum: Scope.all().map(s => s.value),
                        },
                        required: true,
                        size: { min: 1 },
                    },
                    api: {
                        type: "object",
                        required: false,
                        child: {
                            webhook: {
                                type: "object",
                                required: false,
                                child: {
                                    url: SchemaPresets.URL,
                                },
                            },
                        },
                    },
                }).validate(app);

                if (result.valid)
                {
                    if ((await App.withUrl(app!.url!)) !== null)
                        result.add("app/url/already-exists");
                }

                break;
            }
            case "update":
                result = new Schema("app", { /* TODO */ }).validate(old);
                break;
        }

        return result;
    }
}

export class ValidatorResult
{
    public readonly errors: Set<TApiError> = new Set();

    public get valid()
    {
        return this.errors.size === 0;
    };

    public add(error: TApiError): void
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