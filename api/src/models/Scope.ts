import { firestore } from "firebase-admin";

const db = firestore();

type TScopeValue =
    "user.profile" |
    "user.profile.name" |
    "user.profile.name.first" |
    "user.profile.name.last" |
    "user.profile.email";

interface IScope
{
    value: TScopeValue,
}

export interface ISerializedScope
{
    value: TScopeValue,
    description: string,
    includes: ISerializedScope[],
}

export class Scope
{
    private constructor(
        public readonly value: TScopeValue,
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

    private static validate = (scope: string): boolean =>
    {
        return Scope.all().findIndex(s => s.value === scope) > -1;
    }

    public static all = (): Scope[] =>
    {
        return (<TScopeValue[]>[
            "user.profile",
            "user.profile.name",
            "user.profile.name.first",
            "user.profile.name.last",
            "user.profile.email",
        ]).map(scope => new Scope(scope));
    }

    static from = (scopes: string[]): Scope[] =>
    {
        return scopes.map(scope => new Scope(scope as TScopeValue));
    }

    static set = async (app: string, scopes: Scope[]): Promise<void> =>
    {
        if (!scopes.every(scope => Scope.validate(scope.value))) throw new Error("scope/invalid");

        await Scope.delete(app);

        for (const scope of scopes)
        {
            await db.collection(`apps/${app}/scopes`).add(<IScope>{
                value: scope.value,
            });
        }
    }

    static list = async (app: string): Promise<Scope[]> =>
    {
        const snapshot = await db.collection(`apps/${app}/scopes`).get();

        const scopes: Scope[] = [];

        for (const scope of snapshot.docs)
        {
            const data = scope.data() as IScope;

            scopes.push(new Scope(data.value));
        }

        return scopes;
    }

    static delete = async (app: string): Promise<void> =>
    {
        const snapshot = await db.collection(`apps/${app}/scopes`).get();

        for (const scope of snapshot.docs)
        {
            await scope.ref.delete();
        }
    }

    public get description(): string {
        let description: string = "";

        switch (this.value)
        {
            case "user.profile": description = "Your entire profile"; break;
            case "user.profile.name": description = "Your full name"; break;
            case "user.profile.name.first": description = "Your first name"; break;
            case "user.profile.name.last": description = "Your last name"; break;
            case "user.profile.email": description = "Your email"; break;
        }

        return description;
    }
}