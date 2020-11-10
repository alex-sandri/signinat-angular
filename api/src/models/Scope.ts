import { firestore } from "firebase-admin";

const db = firestore();

type TScopeValue =
    "user.profile.name.first" |
    "user.profile.name.last" |
    "user.profile.email";

interface IScope
{
    value: TScopeValue,
}

type TScopeType = "text" | "email";

export interface ISerializedScope
{
    value: TScopeValue,
    metadata: {
        label: string,
        type: TScopeType,
    }
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
        metadata: {
            label: this.label,
            type: this.type,
        }
    });

    static list = async (app: string): Promise<Scope[]> =>
    {
        const snapshot = await db.collection(`apps/${app}/scopes`).get();

        const scopes: Scope[] = [];

        for await (const scope of snapshot.docs)
        {
            const data = scope.data() as IScope;

            scopes.push(new Scope(
                scope.id,
                data.value,
            ));
        }

        return scopes;
    }

    public get label(): string {
        let label: string;

        switch (this.value)
        {
            case "user.profile.name.first": label = "First Name"; break;
            case "user.profile.name.last": label = "Last Name"; break;
            case "user.profile.email": label = "Email"; break;
        }

        return label;
    }

    public get type(): TScopeType {
        let type: TScopeType;

        switch (this.value)
        {
            case "user.profile.email": type = "email"; break;
            default: type = "text"; break;
        }

        return type;
    }
}