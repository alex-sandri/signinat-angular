export interface ISerializedApiError
{
    id: TApiErrorType,
    message: string,
}

export class ApiError
{
    public readonly message: string;

    constructor(public id: TApiErrorType)
    {
        switch (id)
        {
            // ACCOUNT
            case "account/already-exists": this.message = "An account with this app already exists"; break;

            // APP
            case "app/inexistent": this.message = "This app does not exist"; break;
            case "app/name/empty": this.message = "The name cannot be empty"; break;
            case "app/url/empty": this.message = "The URL cannot be empty"; break;
            case "app/url/invalid": this.message = "The URL is invalid"; break;
            case "app/url/already-exists": this.message = "An app with this URL already exists"; break;
            case "app/webhook/url/empty": this.message = "The webhook URL cannot be empty"; break;
            case "app/webhook/url/invalid": this.message = "The webhook URL is invalid"; break;

            // USER
            case "user/required": this.message = "The user is required"; break;
            case "user/inexistent": this.message = "This user does not exist"; break;
            case "user/name/required": this.message = "The name is required"; break;
            case "user/name/first/required": this.message = "The first name is required"; break;
            case "user/name/first/empty": this.message = "The first name cannot be empty"; break;
            case "user/name/last/required": this.message = "The last name is required"; break;
            case "user/name/last/empty": this.message = "The last name cannot be empty"; break;
            case "user/email/required": this.message = "The email is required"; break;
            case "user/email/empty": this.message = "The email cannot be empty"; break;
            case "user/email/already-exists": this.message = "A user with this email already exists"; break;
            case "user/email/inexistent": this.message = "A user with this email does not exist"; break;
            case "user/password/required": this.message = "The password is required"; break;
            case "user/password/empty": this.message = "The password cannot be empty"; break;
            case "user/password/weak": this.message = "Please enter a stronger password"; break;
            case "user/password/wrong": this.message = "Wrong password"; break;
        }
    }

    public json = (): ISerializedApiError =>
    ({
        id: this.id,
        message: this.message,
    });
}

export type TApiErrorType =
    // ACCOUNT
      "account/already-exists"

    // APP
    | "app/inexistent"
    | "app/name/empty"
    | "app/url/empty"
    | "app/url/invalid"
    | "app/url/already-exists"
    | "app/webhook/url/empty"
    | "app/webhook/url/invalid"

    // USER
    | "user/required"
    | "user/inexistent"
    | "user/name/required"
    | "user/name/first/required"
    | "user/name/first/empty"
    | "user/name/last/required"
    | "user/name/last/empty"
    | "user/email/required"
    | "user/email/empty"
    | "user/email/already-exists"
    | "user/email/inexistent"
    | "user/password/required"
    | "user/password/empty"
    | "user/password/weak"
    | "user/password/wrong";