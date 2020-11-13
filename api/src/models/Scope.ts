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
}

export class Scope
{
    private constructor(
        public readonly value: TScopeValue,
    )
    {
        if (!Scope.validate(value)) throw new Error("scope/invalid");
    }

    public json = (): ISerializedScope =>
    ({
        value: this.value,
        description: this.description,
    });

    private static validate = (scope: string): boolean =>
    {
        return Scope.all().includes(scope);
    }

    public static all = (): string[] =>
    {
        return <TScopeValue[]>[
            "user.profile",
            "user.profile.name",
            "user.profile.name.first",
            "user.profile.name.last",
            "user.profile.email",
        ];
    }

    static from = (scopes: string[]): Scope[] =>
    {
        return scopes.map(scope => new Scope(scope as TScopeValue));
    }

    static set = async (app: string, scopes: Scope[]): Promise<void> =>
    {
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