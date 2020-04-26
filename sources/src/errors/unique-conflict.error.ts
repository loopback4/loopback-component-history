// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { Entity } from "@loopback/repository";

export class EntityNotFoundError<ID, Props extends object = {}> extends Error {
    code: string;
    entityName: string;
    entityId: ID;

    constructor(
        entityOrName: typeof Entity | string,
        entityId: ID,
        extraProperties?: Props
    ) {
        const entityName =
            typeof entityOrName === "string"
                ? entityOrName
                : entityOrName.modelName || entityOrName.name;

        super(
            `Conflict ${entityName} with unique fields: ${getUniqueFields(
                ctor,
                models
            )}`
        );

        Error.captureStackTrace(this, this.constructor);

        this.code = "ENTITY_UNIQUE_CONFLICT";
        this.entityName = entityName;
        this.entityId = entityId;

        Object.assign(this, extraProperties);
    }
}
