export default class Constants
{
    public static readonly PASSWORD_MIN_LENGTH = 8;

    public static readonly DATE_FORMAT = "YYYY/MM/DD";

    public static readonly SCOPES = [
        { value: "user", description: "Everything" },
        { value: "user.profile", description: "Your entire profile" },
        { value: "user.profile.name", description: "Your full name" },
        { value: "user.profile.name.first", description: "Your first name" },
        { value: "user.profile.name.last", description: "Your last name" },
        { value: "user.profile.email", description: "Your email" },
        { value: "user.profile.birthday", description: "Your birthday" },
    ] as const;
}