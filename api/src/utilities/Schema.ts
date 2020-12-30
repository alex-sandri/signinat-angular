import validator from "validator";
import { ApiError, ISerializedApiError } from "../models/ApiError";
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
    required: boolean;
    child: SchemaDefinition;
}
|
{
    type: "array";
    required: boolean;
    of: SchemaFieldDefinition;
    size?: {
        min?: number;
        max?: number;
    };
}
|
{
    type: "string";
    required: boolean;
    length?: {
        min?: number;
        max?: number;
    };
    /**
     * Restricts the value to only those contained here
     */
    enum?: string[];
    /**
     * Available formats:
     * - `date`
     * - `url`
     */
    format?: "date" | "email" | "url";
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

        // If `obj` contains properties that are not in `this.schema`, `obj` is considered invalid
        for (const [ key ] of Object.entries(obj))
        {
            if (!this.schema[key])
            {
                result.add(`${this.namespace}/invalid`);

                return result;
            }
        }

        for (const [ field, definition ] of Object.entries(this.schema))
        {
            const fieldNamespace = `${this.namespace}/${field}`;

            const value = obj[field];

            if (definition.required && Utilities.isNullOrUndefined(value))
            {
                result.add(`${fieldNamespace}/required`);

                continue;
            }

            if (!definition.required && Utilities.isNullOrUndefined(value))
            {
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
                        result.add(`${fieldNamespace}/invalid`);
                    }
                    else
                    {
                        const childrenSchema = new Schema(fieldNamespace, { element: definition.of });

                        value.forEach(element =>
                        {
                            result.addAll(Array.from(childrenSchema.validate({ element }).errors));
                        });

                        if (!Utilities.isNullOrUndefined(definition.size))
                        {
                            if (!Utilities.isNullOrUndefined(definition.size.min) && value.length < definition.size.min)
                            {
                                if (value.length === 0)
                                {
                                    result.add(`${fieldNamespace}/empty`);
                                }
                                else
                                {
                                    result.add(`${fieldNamespace}/short`);
                                }
                            }
                            else if (!Utilities.isNullOrUndefined(definition.size.max) && value.length > definition.size.max)
                            {
                                result.add(`${fieldNamespace}/long`);
                            }
                        }
                    }

                    break;
                }
                case "string":
                {
                    if (typeof value !== "string")
                    {
                        result.add(`${fieldNamespace}/invalid`);
                    }
                    else
                    {
                        if (!Utilities.isNullOrUndefined(definition.length))
                        {
                            if (!Utilities.isNullOrUndefined(definition.length.min) && value.length < definition.length.min)
                            {
                                if (value.length === 0)
                                {
                                    result.add(`${fieldNamespace}/empty`);
                                }
                                else
                                {
                                    result.add(`${fieldNamespace}/short`);
                                }
                            }
                            else if (!Utilities.isNullOrUndefined(definition.length.max) && value.length > definition.length.max)
                            {
                                result.add(`${fieldNamespace}/long`);
                            }
                        }

                        if (!Utilities.isNullOrUndefined(definition.enum))
                        {
                            if (!definition.enum.includes(value))
                            {
                                result.add(`${fieldNamespace}/invalid`);
                            }
                        }

                        if (!Utilities.isNullOrUndefined(definition.format))
                        {
                            switch (definition.format)
                            {
                                case "date":
                                {
                                    if (!validator.isDate(value, { format: "YYYY/MM/DD" }))
                                    {
                                        result.add(`${fieldNamespace}/invalid`);
                                    }

                                    break;
                                }
                                case "email":
                                {
                                    if (!validator.isEmail(value))
                                    {
                                        result.add(`${fieldNamespace}/invalid`);
                                    }

                                    break;
                                }
                                case "url":
                                {
                                    if (!validator.isURL(value, { protocols: [ "https" ], require_protocol: true, allow_underscores: true }))
                                    {
                                        result.add(`${fieldNamespace}/invalid`);
                                    }

                                    break;
                                }
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
    public readonly errors: Set<string> = new Set();

    public get valid()
    {
        return this.errors.size === 0;
    }

    public add(error: string): void
    {
        this.errors.add(error);
    }

    public addAll(errors: string[]): void
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
    public static readonly OPTIONAL_NON_EMPTY_STRING: SchemaFieldDefinition = { ...SchemaPresets.NON_EMPTY_STRING, required: false };

    public static readonly DATE: SchemaFieldDefinition = { type: "string", required: true, format: "date" };
    public static readonly OPTIONAL_DATE: SchemaFieldDefinition = { ...SchemaPresets.DATE, required: false };

    public static readonly EMAIL: SchemaFieldDefinition = { type: "string", required: true, format: "email" };
    public static readonly OPTIONAL_EMAIL: SchemaFieldDefinition = { ...SchemaPresets.EMAIL, required: false };

    public static readonly URL: SchemaFieldDefinition = { type: "string", required: true, format: "url" };
    public static readonly OPTIONAL_URL: SchemaFieldDefinition = { ...SchemaPresets.URL, required: false };
}