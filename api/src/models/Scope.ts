const SCOPES = [
    { value: "user", description: "Everything" },
    { value: "user.profile", description: "Your entire profile" },
    { value: "user.profile.name", description: "Your full name" },
    { value: "user.profile.name.first", description: "Your first name" },
    { value: "user.profile.name.last", description: "Your last name" },
    { value: "user.profile.email", description: "Your email" },
    { value: "user.profile.birthday", description: "Your birthday" },
];

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
        return SCOPES.map(scope => new Scope(scope.value));
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
        return SCOPES.find(scope => scope.value === this.value)!.description;
    }
}