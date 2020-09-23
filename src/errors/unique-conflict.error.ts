import { Entity } from "@loopback/repository";

export class EntityUniqueConflictError<
    Props extends object = {}
> extends Error {
    name: string;
    message: string;
    statusCode: number;
    entityName: string;
    fieldName: string;

    constructor(
        entityOrName: typeof Entity | string,
        fieldName: string,
        extraProperties?: Props
    ) {
        const entityName =
            typeof entityOrName === "string"
                ? entityOrName
                : entityOrName.modelName || entityOrName.name;

        super(`Conflict ${entityName} with unique field: ${fieldName}`);

        Error.captureStackTrace(this, this.constructor);

        this.name = "ENTITY_UNIQUE_CONFLICT";
        this.statusCode = 409;
        this.message = `Conflict ${entityName} with unique field: ${fieldName}`;
        this.entityName = entityName;
        this.fieldName = fieldName;

        Object.assign(this, extraProperties);
    }
}
