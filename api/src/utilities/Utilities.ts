export class Utilities
{
    public static isNullOrUndefined(a: any): boolean
    {
        return a === null || a === undefined;
    }

    public static isString(a: any): boolean
    {
        return typeof a === "string";
    }
}