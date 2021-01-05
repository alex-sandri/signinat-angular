import validator from "validator";
import Constants from "../config/Constants";
import Utilities from "./Utilities";

export interface SchemaDefinition
{
    [key: string]: SchemaFieldDefinition;
}

interface ISerializedSchemaFieldError
{
    id: string;
    message: string;
}

interface ISerializedSchemaValidationResult
{
    valid: boolean;
    errors: ISerializedSchemaFieldError[];
}

interface SchemaFieldErrorMessages
{
    required: string;
    invalid: string;
    empty: string;
    short: string;
    long: string;
}

type SchemaFieldDefinition =
{
    type: "object";
    required: boolean;
    child: SchemaDefinition;
    messages?: SchemaFieldErrorMessages;
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
    messages?: SchemaFieldErrorMessages;
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
    format?: "date" | "email" | "tel" | "url";
    messages?: SchemaFieldErrorMessages;
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
                result.add({ id: `${this.namespace}/invalid`, message: "Additional keys are not allowed" });

                return result;
            }
        }

        for (const [ field, definition ] of Object.entries(this.schema))
        {
            const fieldNamespace = `${this.namespace}/${field}`;

            const value = obj[field];

            if (definition.required && Utilities.isNullOrUndefined(value))
            {
                result.add({ id: `${fieldNamespace}/required`, message: definition.messages?.required ?? "Required" });

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
                        result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
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
                                    result.add({ id: `${fieldNamespace}/empty`, message: definition.messages?.empty ?? `Empty (Minimum size: ${definition.size.min})` });
                                }
                                else
                                {
                                    result.add({ id: `${fieldNamespace}/short`, message: definition.messages?.short ?? `Short (Minimum size: ${definition.size.min})` });
                                }
                            }
                            else if (!Utilities.isNullOrUndefined(definition.size.max) && value.length > definition.size.max)
                            {
                                result.add({ id: `${fieldNamespace}/long`, message: definition.messages?.long ?? `Long (Maximum size: ${definition.size.max})` });
                            }
                        }
                    }

                    break;
                }
                case "string":
                {
                    if (typeof value !== "string")
                    {
                        result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
                    }
                    else
                    {
                        if (!Utilities.isNullOrUndefined(definition.length))
                        {
                            if (!Utilities.isNullOrUndefined(definition.length.min) && value.length < definition.length.min)
                            {
                                if (value.length === 0)
                                {
                                    result.add({ id: `${fieldNamespace}/empty`, message: definition.messages?.empty ?? `Empty (Minimum length: ${definition.length.min})` });
                                }
                                else
                                {
                                    result.add({ id: `${fieldNamespace}/short`, message: definition.messages?.short ?? `Short (Minimum length: ${definition.length.min})` });
                                }
                            }
                            else if (!Utilities.isNullOrUndefined(definition.length.max) && value.length > definition.length.max)
                            {
                                result.add({ id: `${fieldNamespace}/long`, message: definition.messages?.long ?? `Long (Maximum length: ${definition.length.max})` });
                            }
                        }

                        if (!Utilities.isNullOrUndefined(definition.enum))
                        {
                            if (!definition.enum.includes(value))
                            {
                                result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
                            }
                        }

                        if (!Utilities.isNullOrUndefined(definition.format))
                        {
                            switch (definition.format)
                            {
                                case "date":
                                {
                                    if (!validator.isDate(value, { format: Constants.DATE_FORMAT }))
                                    {
                                        result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
                                    }

                                    break;
                                }
                                case "email":
                                {
                                    if (!validator.isEmail(value))
                                    {
                                        result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
                                    }

                                    break;
                                }
                                case "tel":
                                {
                                    if (!validator.isMobilePhone(value, "any", { strictMode: true }))
                                    {
                                        result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
                                    }

                                    break;
                                }
                                case "url":
                                {
                                    if (!validator.isURL(value, { protocols: [ "https" ], require_protocol: true, allow_underscores: true }))
                                    {
                                        result.add({ id: `${fieldNamespace}/invalid`, message: definition.messages?.invalid ?? "Invalid" });
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
    public readonly errors: Set<ISerializedSchemaFieldError> = new Set();

    public get valid()
    {
        return this.errors.size === 0;
    }

    public add(error: ISerializedSchemaFieldError): void
    {
        this.errors.add(error);
    }

    public addAll(errors: ISerializedSchemaFieldError[]): void
    {
        errors.forEach(error => this.add(error));
    }

    public json(): ISerializedSchemaValidationResult
    {
        return {
            valid: this.valid,
            errors: Array.from(this.errors),
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

    public static readonly TEL: SchemaFieldDefinition = { type: "string", required: true, format: "tel" };
    public static readonly OPTIONAL_TEL: SchemaFieldDefinition = { ...SchemaPresets.TEL, required: false };
}