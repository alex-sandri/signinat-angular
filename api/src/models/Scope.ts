import { firestore } from "firebase-admin";

const db = firestore();

interface IScope
{
    value: string,
}

export interface ISerializedScope
{
    value: string,
}

export class Scope
{
    private constructor(
        public readonly id: string,
        public readonly value: string,
    ) {}

    public json = (): ISerializedScope =>
    ({
        value: this.value,
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
}