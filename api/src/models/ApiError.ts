export interface ISerializedApiError
{
    id: string,
    message: string,
}

export class ApiError
{
    public readonly message: string;

    constructor(public id: string)
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
            case "user/name/first/invalid": this.message = "The first name is invalid"; break;
            case "user/name/first/empty": this.message = "The first name cannot be empty"; break;
            case "user/name/last/required": this.message = "The last name is required"; break;
            case "user/name/last/invalid": this.message = "The last name is invalid"; break;
            case "user/name/last/empty": this.message = "The last name cannot be empty"; break;
            case "user/email/required": this.message = "The email is required"; break;
            case "user/email/invalid": this.message = "The email is invalid"; break;
            case "user/email/empty": this.message = "The email cannot be empty"; break;
            case "user/email/already-exists": this.message = "A user with this email already exists"; break;
            case "user/email/inexistent": this.message = "A user with this email does not exist"; break;
            case "user/password/required": this.message = "The password is required"; break;
            case "user/password/invalid": this.message = "The password is invalid"; break;
            case "user/password/empty": this.message = "The password cannot be empty"; break;
            case "user/password/short": this.message = "Please enter a stronger password"; break;
            case "user/password/wrong": this.message = "Wrong password"; break;
            case "user/birthday/empty": this.message = "The birthday cannot be empty"; break;
            case "user/birthday/invalid": this.message = "The birthday is invalid"; break;

            default: this.message = "Unknown error"; break;
        }
    }

    public json = (): ISerializedApiError =>
    ({
        id: this.id,
        message: this.message,
    });
}