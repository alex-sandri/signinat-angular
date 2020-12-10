import { TApiErrorType } from "../models/ApiError";
import { User } from "../models/User";

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

        switch (this.type)
        {
            case "create":
                if (!user.name) result.add("user/name/required");
                else
                {
                    if (!user.name.first) result.add("user/name/first/required");
                    else if (user.name.first.length === 0) result.add("user/name/first/empty");

                    if (!user.name.last) result.add("user/name/last/required");
                    else if (user.name.last.length === 0) result.add("user/name/last/empty");
                }

                if (!user.email) result.add("user/email/required");
                else if (user.email.length === 0) result.add("user/email/empty");
                else if (await User.exists(user.email)) result.add("user/email/already-exists");

                if (!user.password) result.add("user/password/required");
                else if (user.password.length === 0) result.add("user/password/empty");
                else if (user.password.length < 8) result.add("user/password/weak");
                break;
            case "update":
                // TODO
                break;
        }

        return result;
    }
}

class ValidatorResult
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
}