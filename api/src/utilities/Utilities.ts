export default class Utilities
{
    public static isNullOrUndefined(a?: any): a is null | undefined
    {
        return a === null || a === undefined;
    }

    public static isString(a?: any): a is string
    {
        return typeof a === "string";
    }

    public static isEmpty(a: string): boolean
    {
        return a.length === 0;
    }
}