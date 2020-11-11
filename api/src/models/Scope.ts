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
        public readonly id: string,
        public readonly value: TScopeValue,
    ) {}

    public json = (): ISerializedScope =>
    ({
        value: this.value,
        description: this.description,
    });

    static set = async (app: string, scopes: string[]): Promise<void> =>
    {
        // TODO
        // Validate scopes

        for (const scope of scopes)
        {
            await db.collection(`apps/${app}/scopes`).add(<IScope>{
                value: scope,
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

            scopes.push(new Scope(
                scope.id,
                data.value,
            ));
        }

        return scopes;
    }

    public get description(): string {
        let description: string;

        switch (this.value)
        {
            case "user.profile": description = "TODO"; break;
            case "user.profile.name": description = "TODO"; break;
            case "user.profile.name.first": description = "TODO"; break;
            case "user.profile.name.last": description = "TODO"; break;
            case "user.profile.email": description = "TODO"; break;
        }

        return description;
    }
}