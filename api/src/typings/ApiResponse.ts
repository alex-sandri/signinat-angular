import { ISerializedApiError } from "../models/ApiError";

export interface ApiResponse
{
    result: {
        valid: boolean,
        data?: any,
    },
    errors: ISerializedApiError[],
}