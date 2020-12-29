import { ApiError, ISerializedApiError, TApiError, TApiErrorFieldPrefix } from "../models/ApiError";

interface SchemaDefinition
{
    [key: string]: SchemaDefinition | SchemaFieldDefinition;
}

interface ISerializedSchemaValidationResult
{
    valid: boolean,
    errors: ISerializedApiError[],
}

type SchemaFieldDefinition =
{
    type: "string";
    id: TApiErrorFieldPrefix,
    required?: boolean;
    length?: {
        min?: number;
        max?: number;
    };
}

export default class Schema
{
    public constructor(definition: SchemaDefinition)
    {}

    public validate(): SchemaValidationResult
    {
        let result = new SchemaValidationResult();

        // TODO

        return result;
    }
}

class SchemaValidationResult
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