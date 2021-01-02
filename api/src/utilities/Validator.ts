import { Account } from "../models/Account";
import { App, ISerializedApp } from "../models/App";
import { TAuthTokenType } from "../models/AuthToken";
import { Scope } from "../models/Scope";
import { ISerializedUser, User } from "../models/User";
import Constants from "./Constants";
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
    },
}

export interface IAppToken
{
    app?: string,
}

export interface IUserToken
{
    email?: string,
    password?: string,
}

export type IToken = IAppToken | IUserToken;

export interface IAccount
{
    app?: string;
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
     * @returns `Promise<SchemaValidationResult>` Validation success
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
                        length: { min: Constants.PASSWORD_MIN_LENGTH },
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
                        length: { min: Constants.PASSWORD_MIN_LENGTH },
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
     * @returns `Promise<SchemaValidationResult>` Validation success
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
                }).validate(app);

                if (result.valid)
                {
                    if ((await App.withUrl(app!.url!)) !== null)
                        result.add("app/url/already-exists");
                }

                break;
            }
            case "update":
            {
                result = new Schema("app", {
                    name: SchemaPresets.OPTIONAL_NON_EMPTY_STRING,
                    url: SchemaPresets.OPTIONAL_URL,
                    scopes: {
                        type: "array",
                        of: {
                            type: "string",
                            required: true,
                            enum: Scope.all().map(s => s.value),
                        },
                        required: false,
                        size: { min: 1 },
                    },
                }).validate(app);

                if (Utilities.isNullOrUndefined(old))
                {
                    result.add("app/required");
                }
                else if (result.valid)
                {
                    if (!Utilities.isNullOrUndefined(app!.url))
                    {
                        if (app!.url !== old.url && await App.withUrl(app!.url) !== null)
                        {
                            result.add("app/url/already-exists");
                        }
                    }
                }

                break;
            }
        }

        return result;
    }

    /**
     * Validates a token object
     * 
     * @param token The token object to validate
     * @param type The token type
     * 
     * @returns `Promise<SchemaValidationResult>` Validation success
     */
    public async token(token?: IToken, type?: TAuthTokenType): Promise<SchemaValidationResult>
    {
        let result: SchemaValidationResult;

        if (Utilities.isNullOrUndefined(type))
        {
            result = new SchemaValidationResult();

            result.add("token/type/required");

            return result;
        }

        switch (type)
        {
            case "app":
            {
                result = new Schema("token", {
                    app: SchemaPresets.NON_EMPTY_STRING,
                }).validate(token);

                if (result.valid)
                {
                    const app = await App.retrieve((token as IAppToken).app!);

                    if (!app)
                    {
                        result.add("app/inexistent");
                    }
                }

                break;
            }
            case "user":
            {
                result = new Schema("token", {
                    email: SchemaPresets.EMAIL,
                    password: SchemaPresets.NON_EMPTY_STRING,
                }).validate(token);

                if (result.valid)
                {
                    const user = await User.withEmail((token as IUserToken).email!);

                    if (!user)
                    {
                        result.add("user/inexistent");
                    }
                    else if (!Utilities.verifyHash((token as IUserToken).password!, user.data.password))
                    {
                        result.add("user/password/wrong");
                    }
                }

                break;
            }
        }

        return result;
    }

    /**
     * Validates an account object
     * 
     * @param account The account object to validate
     * @param user The owner of the account
     * 
     * @returns `Promise<SchemaValidationResult>` Validation success
     */
    public async account(account: IAccount, user: User): Promise<SchemaValidationResult>
    {
        let result: SchemaValidationResult;

        result = new Schema("account", {
            app: SchemaPresets.NON_EMPTY_STRING,
        }).validate(account);

        if (result.valid)
        {
            const app = await App.retrieve(account.app!);

            if (!app)
            {
                result.add("app/inexistent");
            }
            else if (await Account.exists(user, app.id))
            {
                result.add("account/already-exists");
            }
        }

        return result;
    }
}