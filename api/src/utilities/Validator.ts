import { App, ISerializedApp } from "../models/App";
import { Scope } from "../models/Scope";
import { ISerializedUser, User } from "../models/User";
import Schema, { SchemaPresets, SchemaValidationResult } from "./Schema";
import Utilities from "./Utilities";

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
    public async user(user?: IUser, old?: ISerializedUser): Promise<SchemaValidationResult>
    {
        let result: SchemaValidationResult;

        switch (this.type)
        {
            case "create":
            {
                result = new Schema("user", {
                    name: {
                        type: "object",
                        required: true,
                        child: {
                            first: SchemaPresets.NON_EMPTY_STRING,
                            last: SchemaPresets.NON_EMPTY_STRING,
                        },
                    },
                    email: SchemaPresets.EMAIL,
                    password: {
                        type: "string",
                        required: true,
                        length: { min: ValidatorConstants.PASSWORD_MIN_LENGTH },
                    },
                    birthday: SchemaPresets.OPTIONAL_DATE,
                }).validate(user);

                if (result.valid)
                {
                    if (await User.exists(user!.email!))
                    {
                        result.add("user/email/already-exists");
                    }
                }

                break;
            }
            case "update":
            {
                result = new Schema("user", {
                    name: {
                        type: "object",
                        required: false,
                        child: {
                            first: SchemaPresets.OPTIONAL_NON_EMPTY_STRING,
                            last: SchemaPresets.OPTIONAL_NON_EMPTY_STRING,
                        },
                    },
                    email: SchemaPresets.OPTIONAL_EMAIL,
                    password: {
                        type: "string",
                        required: false,
                        length: { min: ValidatorConstants.PASSWORD_MIN_LENGTH },
                    },
                    birthday: SchemaPresets.OPTIONAL_DATE,
                }).validate(user);

                if (Utilities.isNullOrUndefined(old))
                {
                    result.add("user/required");
                }
                else if (result.valid)
                {
                    if (!Utilities.isNullOrUndefined(user!.email))
                    {
                        if (user!.email !== old.email && await User.exists(user!.email))
                        {
                            result.add("user/email/already-exists");
                        }
                    }
                }

                break;
            }
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

export class ValidatorConstants
{
    public static readonly PASSWORD_MIN_LENGTH = 8;
    public static readonly BIRTHDAY_FORMAT = "YYYY-MM-DD";
}