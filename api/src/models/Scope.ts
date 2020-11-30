import { firestore } from "firebase-admin";

const db = firestore();

const SCOPES = [
    { value: "user", description: "Everything" },
    { value: "user.profile", description: "Your entire profile" },
    { value: "user.profile.name", description: "Your full name" },
    { value: "user.profile.name.first", description: "Your first name" },
    { value: "user.profile.name.last", description: "Your last name" },
    { value: "user.profile.email", description: "Your email" },
    { value: "user.profile.birthday", description: "Your birthday" },
];

interface IScope
{
    value: string,
}

export interface ISerializedScope
{
    value: string,
    description: string,
    includes: ISerializedScope[],
}

/**
 * @todo
 * 
 * When a user creates an account save the app scopes
 * and when that token is used an app can only access
 * those scopes and not more or less if the app
 * updates the scopes it needs, this is to safeguard
 * the user against malicious apps that might ask for
 * only one scope and then, after and update, ask for
 * full control of the user account.
 */

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

    private static validate = (scope: string): boolean =>
    {
        return Scope.all().findIndex(s => s.value === scope) > -1;
    }

    public static all = (): Scope[] =>
    {
        return SCOPES.map(scope => new Scope(scope.value));
    }

    static from = (scopes: string[]): Scope[] =>
    {
        return scopes.map(scope => new Scope(scope));
    }

    static set = async (app: string, scopes: Scope[]): Promise<void> =>
    {
        if (!scopes.every(scope => Scope.validate(scope.value))) throw new Error("scope/invalid");

        await Scope.delete(app);

        /*
            Remove more specific scopes

            Example:
            'user.profile' is removed if 'user' is a selected scope
        */
        scopes = scopes.filter(scope =>
        {
            return scopes.findIndex(temp => scope.value.startsWith(`${temp.value}.`)) === -1;
        });

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

    public canAccess = (scope: string): boolean =>
    {
        return scope.startsWith(`${this.value}.`)
            || scope === this.value;
    }

    public get description(): string {
        return SCOPES.find(scope => scope.value === this.value)!.description;
    }
}