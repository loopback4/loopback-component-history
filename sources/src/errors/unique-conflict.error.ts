import { Entity } from "@loopback/repository";

export class EntityUniqueConflictError<
    Props extends object = {}
> extends Error {
    code: string;
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

        this.code = "ENTITY_UNIQUE_CONFLICT";
        this.entityName = entityName;
        this.entityUniqueFields = entityUniqueFields;

        Object.assign(this, extraProperties);
    }
}
