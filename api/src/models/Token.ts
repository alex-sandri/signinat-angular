import { Session } from "./Session";
import { User } from "./User";

export class Token
{
    public readonly value: string;

    constructor(public readonly user: User, public readonly session: Session)
    {
        this.value = `${user.id};${session.id}`;
    }

    public static async fromString(token?: string): Promise<Token | null>
    {
        if (!token) return null;

        const user = await User.retrieve(token.split(";")[0]);

        if (!user) return null;

        const session = await Session.retrieve(user, token.split(";")[1]);

        if (!session) return null;

        return new Token(
            user,
            session,
        );
    }
}