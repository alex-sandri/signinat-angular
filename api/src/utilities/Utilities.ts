export default class Utilities
{
    public static isNullOrUndefined(a?: any): a is null | undefined
    {
        return a === null || a === undefined;
    }
}