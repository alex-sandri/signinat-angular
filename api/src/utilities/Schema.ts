import { ApiError, ISerializedApiError, TApiError, TApiErrorFieldPrefix } from "../models/ApiError";

interface ISerializedSchemaValidationResult
{
    valid: boolean,
    errors: ISerializedApiError[],
}

type SchemaDefinition =
{
    type: "object";
    id: TApiErrorFieldPrefix;
    required?: boolean;
    child?: SchemaDefinition;
}
|
{
    type: "string";
    id: TApiErrorFieldPrefix;
    required?: boolean;
    length?: {
        min?: number;
        max?: number;
    };
}

export default class Schema
{
    public constructor(private schema: SchemaDefinition)
    {}

    public validate(obj: any): SchemaValidationResult
    {
        let result = new SchemaValidationResult();

        for (const [ key, value ] of Object.entries(this.schema))
        {
            switch (value.type)
            {
                case "object":
                    break;
                case "string":
                    break;
            }
        }

        return result;
    }
}

export class SchemaValidationResult
{
    public readonly errors: Set<TApiError> = new Set();

    public get valid()
    {
        return this.errors.size === 0;
    };

    public add(error: TApiError): void
    {
        this.errors.add(error);
    }

    public json(): ISerializedSchemaValidationResult
    {
        return {
            valid: this.valid,
            errors: Array.from(this.errors).map(error => new ApiError(error).json()),
        };
    }
}