import { MixinTarget } from "@loopback/core";
import {
    EntityCrudRepository,
    DataObject,
    Options,
    Filter,
    FilterExcludingWhere,
    Where,
    EntityNotFoundError,
} from "@loopback/repository";

import { EntityUniqueConflictError } from "../errors";
import { HistoryEntity, HistoryEntityRelations } from "../models";

export interface HistoryOptions extends Options {
    all?: true;
}
// TODO: remove dependency findById -> find
// TODO: remove dependency exists -> count
// TODO: remove dependency update -> updateAll
// TODO: remove dependency updateById -> updateAll
// TODO: remove dependency replaceById -> updateAll
// TODO: remove dependency delete -> deleteAll
// TODO: remove dependency deleteById -> deleteAll

/**
 * Find ctor unique columns
 * then get entities unique columns values
 * for each unique column, values pair check duplicated values are not existed
 * check the values with column, values pair where count is 0
 * if where existed (update), check updatable count is less than 1
 */
const isUnique = async <
    T extends HistoryEntity,
    Relations extends HistoryEntityRelations
>(
    repository: EntityCrudRepository<T, string, Relations>,
    entities: DataObject<T>[],
    where?: Where<T>,
    options?: HistoryOptions
) => {
    const ctorUniqueFields = Object.entries(
        repository.entityClass.definition.properties
    )
        .filter(([_, definition]) => definition.unique)
        .map(([fieldName, _]) => fieldName);

    const entitiesUniqueFields = ctorUniqueFields
        .map((fieldName) => ({
            field: fieldName,
            items: entities
                .map<string>((entity: any) => entity[fieldName])
                .filter((item) => item),
        }))
        .filter(({ items }) => items.length > 0);

    if (entitiesUniqueFields.length <= 0) {
        return;
    }

    for (let { field, items } of entitiesUniqueFields) {
        if (new Set(items).size !== items.length) {
            throw new EntityUniqueConflictError(repository.entityClass, field);
        }
    }

    const entitiesUniqueFieldsWhere: any = {
        and: [
            { endDate: null },
            {
                or: entitiesUniqueFields.map(({ field, items }) => ({
                    [field]: { inq: items },
                })),
            },
        ],
    };

    const conflicts = await repository.count(entitiesUniqueFieldsWhere, {
        ...options,
        all: true,
    });
    if (conflicts.count > 0) {
        throw new EntityUniqueConflictError(
            repository.entityClass,
            entitiesUniqueFields.map(({ field }) => field).join(",")
        );
    }

    if (where) {
        const updatables = await repository.count(where, {
            ...options,
            all: true,
        });
        if (updatables.count > 1) {
            throw new EntityUniqueConflictError(
                repository.entityClass,
                entitiesUniqueFields.map(({ field }) => field).join(",")
            );
        }
    }
};

/**
 * History repository mixin, add CRUD operations supporting history
 */
export function HistoryRepositoryMixin<
    T extends HistoryEntity,
    Relations extends HistoryEntityRelations
>() {
    return function <
        R extends MixinTarget<EntityCrudRepository<T, string, Relations>>
    >(superClass: R) {
        class MixedRepository extends superClass {
            /**
             * Check entities unique fields
             * then set `uid`, `beginDate`, `endDate`, `id` to undefined
             * then create entities
             */
            createAll = async (
                entities: DataObject<T>[],
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.createAll(entities, options);
                }

                await isUnique(this, entities, undefined, options);

                return await super.createAll(
                    entities.map((entity) => ({
                        ...entity,
                        uid: undefined,
                        beginDate: undefined,
                        endDate: undefined,
                        id: undefined,
                    })),
                    options
                );
            };

            /**
             * Check entity unique fields
             * then set `uid`, `beginDate`, `endDate`, `id` to undefined
             * then create entity
             */
            create = async (
                entity: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.create(entity, options);
                }

                await isUnique(this, [entity], undefined, options);

                return await super.create(
                    {
                        ...entity,
                        uid: undefined,
                        beginDate: undefined,
                        endDate: undefined,
                        id: undefined,
                    },
                    options
                );
            };

            /**
             * Find all entities by filter and {endDate: null}
             */
            find = async (filter?: Filter<T>, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.find(filter, options);
                }

                return await super.find(
                    {
                        ...filter,
                        where: {
                            and: [
                                { endDate: null },
                                filter?.where as any,
                            ].filter((condition) => condition),
                        },
                    },
                    options
                );
            };

            /**
             * Find one entity by filter and {id: id, endDate: null}
             */
            findById = async (
                id: string,
                filter?: FilterExcludingWhere<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.findById(id, filter, options);
                }

                const result = await this.find(
                    {
                        ...filter,
                        where: this.entityClass.buildWhereForId(id),
                    },
                    options
                );

                if (result[0]) {
                    return result[0];
                } else {
                    throw new EntityNotFoundError(this.entityClass, id);
                }
            };

            /**
             * Count all entities by where and {endDate: null}
             */
            count = async (where?: Where<T>, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.count(where, options);
                }

                return await super.count(
                    {
                        and: [{ endDate: null }, where as any].filter(
                            (condition) => condition
                        ),
                    },
                    options
                );
            };

            /**
             * History exists() using count()
             */
            exists = async (id: string, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.exists(id, options);
                }

                const result = await this.count(
                    this.entityClass.buildWhereForId(id),
                    options
                );

                return result.count > 0;
            };

            /**
             * Check data unique fields by where and {endDate: null}
             * and get target models by where and {endDate: null}
             * and create updated models with {endDate: null}
             * then update old models and set {endDate: now()}
             */
            updateAll = async (
                data: DataObject<T>,
                where?: Where<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.updateAll(data, where, options);
                }

                await isUnique(
                    this,
                    [data],
                    {
                        and: [{ endDate: null }, where as any].filter(
                            (condition) => condition
                        ),
                    },
                    options
                );

                const targets = await super.find(
                    {
                        where: {
                            and: [{ endDate: null }, where as any].filter(
                                (condition) => condition
                            ),
                        },
                    },
                    options
                );

                await super.createAll(
                    targets.map((target) => ({
                        ...target,
                        ...data,
                        uid: undefined,
                        beginDate: undefined,
                        endDate: undefined,
                        id: target.id,
                    })),
                    options
                );

                return await super.updateAll(
                    { endDate: new Date() },
                    {
                        uid: { inq: targets.map((target) => target.uid) },
                    } as any,
                    options
                );
            };

            /**
             * History updateById() using updateAll()
             */
            updateById = async (
                id: string,
                data: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.updateById(id, data, options);
                }

                await this.updateAll(
                    data,
                    this.entityClass.buildWhereForId(id),
                    options
                );
            };

            /**
             * History update() using updateAll()
             */
            update = async (entity: T, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.update(entity, options);
                }

                await this.updateAll(
                    entity,
                    this.entityClass.buildWhereForId(
                        this.entityClass.getIdOf(entity)
                    ),
                    options
                );
            };

            /**
             * History replaceById() using updateAll()
             */
            replaceById = async (
                id: string,
                data: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.replaceById(id, data, options);
                }

                await this.updateAll(
                    {
                        ...Object.fromEntries(
                            Object.entries(
                                this.entityClass.definition.properties
                            ).map(([key, _]) => [key, undefined])
                        ),
                        ...data,
                    },
                    this.entityClass.buildWhereForId(id),
                    options
                );
            };

            /**
             * Update all entities by where and {endDate: null}, set {endDate: now()}
             */
            deleteAll = async (where?: Where<T>, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.deleteAll(where, options);
                }

                return await super.updateAll(
                    { endDate: new Date() },
                    {
                        and: [{ endDate: null }, where as any].filter(
                            (condition) => condition
                        ),
                    },
                    options
                );
            };

            /**
             * History delete() using deleteAll()
             */
            delete = async (entity: T, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.delete(entity, options);
                }

                await this.deleteAll(
                    this.entityClass.buildWhereForId(
                        this.entityClass.getIdOf(entity)
                    ),
                    options
                );
            };

            /**
             * History deleteById() using deleteAll()
             */
            deleteById = async (id: string, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.deleteById(id, options);
                }

                await this.deleteAll(
                    this.entityClass.buildWhereForId(id),
                    options
                );
            };
        }

        return MixedRepository;
    };
}
