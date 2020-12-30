import { ApiError, ISerializedApiError, TApiError } from "../models/ApiError";
import Utilities from "./Utilities";

interface SchemaDefinition
{
    [key: string]: SchemaFieldDefinition;
}

interface ISerializedSchemaValidationResult
{
    valid: boolean;
    errors: ISerializedApiError[];
}

type SchemaFieldDefinition =
{
    type: "object";
    required?: boolean;
    child: SchemaDefinition;
}
|
{
    type: "array";
    required?: boolean;
    of: SchemaFieldDefinition;
    size?: {
        min?: number;
        max?: number;
    };
}
|
{
    type: "string";
    required?: boolean;
    length?: {
        min?: number;
        max?: number;
    };
    /**
     * Restricts the value to only those contained here
     */
    enum?: string[];
}

export default class Schema
{
    public constructor(
        private namespace: string,
        private schema: SchemaDefinition,
    )
    {}

    public validate(obj: any): SchemaValidationResult
    {
        let result = new SchemaValidationResult();

        for (const [ field, definition ] of Object.entries(this.schema))
        {
            const fieldNamespace = `${this.namespace}/${field}`;

            const value = obj[field];

            if (definition.required && Utilities.isNullOrUndefined(value))
            {
                result.add(`${fieldNamespace}/required` as TApiError);

                continue;
            }

            switch (definition.type)
            {
                case "object":
                {
                    const childSchema = new Schema(fieldNamespace, definition.child);

                    result.addAll(Array.from(childSchema.validate(obj[field]).errors));

                    break;
                }
                case "array":
                {
                    if (!Array.isArray(value))
                    {
                        result.add(`${fieldNamespace}/invalid` as TApiError);
                    }
                    else
                    {
                        const childrenSchema = new Schema(fieldNamespace, { element: definition.of });

                        value.forEach(element =>
                        {
                            result.addAll(Array.from(childrenSchema.validate({ element }).errors));
                        });
                    }

                    break;
                }
                case "string":
                {
                    if (typeof value !== "string")
                    {
                        result.add(`${fieldNamespace}/invalid` as TApiError);
                    }
                    else
                    {
                        if (!Utilities.isNullOrUndefined(definition.length))
                        {
                            if (!Utilities.isNullOrUndefined(definition.length.min) && value.length < definition.length.min)
                            {
                                result.add(`${fieldNamespace}/short` as TApiError);
                            }
                            else if (!Utilities.isNullOrUndefined(definition.length.max) && value.length > definition.length.max)
                            {
                                result.add(`${fieldNamespace}/long` as TApiError);
                            }
                        }

                        if (!Utilities.isNullOrUndefined(definition.enum))
                        {
                            if (!definition.enum.includes(value))
                            {
                                result.add(`${fieldNamespace}/invalid` as TApiError);
                            }
                        }
                    }

                    break;
                }
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
    }

    public add(error: TApiError): void
    {
        this.errors.add(error);
    }

    public addAll(errors: TApiError[]): void
    {
        errors.forEach(error => this.add(error));
    }

    public json(): ISerializedSchemaValidationResult
    {
        return {
            valid: this.valid,
            errors: Array.from(this.errors).map(error => new ApiError(error).json()),
        };
    }
}

export class SchemaPresets
{
    public static readonly NON_EMPTY_STRING: SchemaFieldDefinition = { type: "string", required: true, length: { min: 1 } };
}