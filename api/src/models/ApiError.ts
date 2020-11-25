export class ApiError
{
    public readonly message: string;

    private static readonly EMPTY_FIELD = "This field cannot be empty";

    constructor(public id: TApiErrorType)
    {
        switch (id)
        {
            case "user/name/first/empty": this.message = ApiError.EMPTY_FIELD; break;

            case "user/name/last/empty": this.message = ApiError.EMPTY_FIELD; break;

            case "user/email/empty": this.message = ApiError.EMPTY_FIELD; break;
            case "user/email/already-exists": this.message = "A user with this email already exists"; break;
            case "user/email/inexistent": this.message = "A user with this email does not exist"; break;

            case "user/password/empty": this.message = ApiError.EMPTY_FIELD; break;
            case "user/password/weak": this.message = "Please enter a stronger password"; break;
            case "user/password/wrong": this.message = "Wrong password"; break;

            case "app/name/empty": this.message = ApiError.EMPTY_FIELD; break;

            case "app/url/empty": this.message = ApiError.EMPTY_FIELD; break;
            case "app/url/already-exists": this.message = "An app with this URL already exists"; break;

            default: this.message = "Unknown error"; break;
        }
    }
}

type TApiErrorType =
    // ACCOUNT
      "account/already-exists"

    // APP
    | "app/inexistent"

    | "app/name/empty"

    | "app/url/empty"
    | "app/url/already-exists"

    // USER
    | "user/inexistent"

    | "user/name/first/empty"

    | "user/name/last/empty"

    | "user/email/empty"
    | "user/email/already-exists"
    | "user/email/inexistent"

    | "user/password/required"
    | "user/password/empty"
    | "user/password/weak"
    | "user/password/wrong";