import { Entity } from "@loopback/repository";

export class EntityUniqueConflictError<
    Props extends object = {}
> extends Error {
    name: string;
    message: string;
    statusCode: number;
    entityName: string;
    entityUniqueFields: string[];

    constructor(
        entityOrName: typeof Entity | string,
        entityUniqueFields: string[],
        extraProperties?: Props
    ) {
        const entityName =
            typeof entityOrName === "string"
                ? entityOrName
                : entityOrName.modelName || entityOrName.name;

        super(
            `Conflict ${entityName} with unique fields: ${entityUniqueFields}`
        );

        Error.captureStackTrace(this, this.constructor);

        this.name = "ENTITY_UNIQUE_CONFLICT";
        this.statusCode = 409;
        this.message = `Conflict ${entityName} with unique fields: ${entityUniqueFields}`;
        this.entityName = entityName;
        this.entityUniqueFields = entityUniqueFields;

        Object.assign(this, extraProperties);
    }
}
