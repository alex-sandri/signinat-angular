import { Scope } from "../models/Scope";
import { SchemaDefinition, SchemaPresets } from "../utilities/Schema";
import Constants from "./Constants";

export const USER_CREATE_SCHEMA: SchemaDefinition = {
    name: {
        type: "object",
        required: true,
        child: {
            first: SchemaPresets.NON_EMPTY_STRING,
            last: SchemaPresets.NON_EMPTY_STRING,
        },
    },
    email: SchemaPresets.EMAIL,
    password: {
        type: "string",
        required: true,
        length: { min: Constants.PASSWORD_MIN_LENGTH },
    },
    birthday: SchemaPresets.OPTIONAL_DATE,
};

export const USER_UPDATE_SCHEMA: SchemaDefinition = {
    name: {
        type: "object",
        required: false,
        child: {
            first: SchemaPresets.OPTIONAL_NON_EMPTY_STRING,
            last: SchemaPresets.OPTIONAL_NON_EMPTY_STRING,
        },
    },
    email: SchemaPresets.OPTIONAL_EMAIL,
    password: {
        type: "string",
        required: false,
        length: { min: Constants.PASSWORD_MIN_LENGTH },
    },
    birthday: SchemaPresets.OPTIONAL_DATE,
};

export const APP_CREATE_SCHEMA: SchemaDefinition = {
    name: SchemaPresets.NON_EMPTY_STRING,
    url: SchemaPresets.URL,
    scopes: {
        type: "array",
        of: {
            type: "string",
            required: true,
            enum: Scope.all().map(s => s.value),
        },
        required: true,
        size: { min: 1 },
    },
};

export const APP_UPDATE_SCHEMA: SchemaDefinition = {
    name: SchemaPresets.OPTIONAL_NON_EMPTY_STRING,
    url: SchemaPresets.OPTIONAL_URL,
    scopes: {
        type: "array",
        of: {
            type: "string",
            required: true,
            enum: Scope.all().map(s => s.value),
        },
        required: false,
        size: { min: 1 },
    },
};

export const APP_TOKEN_SCHEMA: SchemaDefinition = {
    app: SchemaPresets.NON_EMPTY_STRING,
};

export const USER_TOKEN_SCHEMA: SchemaDefinition = {
    email: SchemaPresets.EMAIL,
    password: SchemaPresets.NON_EMPTY_STRING,
};

export const ACCOUNT_SCHEMA: SchemaDefinition = {
    app: SchemaPresets.NON_EMPTY_STRING,
};