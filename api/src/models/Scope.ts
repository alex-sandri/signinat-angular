import Constants from "../config/Constants";

export interface ISerializedScope
{
    value: string,
    description: string,
    includes: ISerializedScope[],
}

export class Scope
{
    public static readonly ROOT = new Scope("user");

    private constructor(
        public readonly value: string,
    ) {}

    public json = (): ISerializedScope =>
    ({
        value: this.value,
        description: this.description,
        includes: Scope
            .all()
            .filter(scope => scope.value.match(`^${this.value}\.[^\.]+$`))
            .map(scope => scope.json()),
    });

    public static all = (): Scope[] =>
    {
        return Constants.SCOPES.map(scope => new Scope(scope.value));
    }

    static from = (scopes: string[]): Scope[] =>
    {
        return scopes.map(scope => new Scope(scope));
    }

    static filterUnnecessary(list: string[]): string[]
    {
        const scopes = Scope.from(list);

        /*
            Remove more specific scopes

            Example:
            'user.profile' is removed if 'user' is a selected scope
        */
        return scopes
            .filter(scope =>
            {
                return scopes.findIndex(temp => scope.value.startsWith(`${temp.value}.`)) === -1;
            })
            .map(scopes => scopes.value);
    }

    public canAccess = (scope: string): boolean =>
    {
        return scope.startsWith(`${this.value}.`)
            || scope === this.value;
    }

    public get description(): string {
        return Constants.SCOPES.find(scope => scope.value === this.value)!.description;
    }
}