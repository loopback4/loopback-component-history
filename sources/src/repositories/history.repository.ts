import { MixinTarget } from "@loopback/core";
import {
    DefaultCrudRepository,
    DataObject,
    Options,
    Filter,
    FilterExcludingWhere,
    Where,
} from "@loopback/repository";

import { EntityUniqueConflictError } from "../errors";
import { HistoryEntity, HistoryEntityRelations } from "../models";

export interface HistoryOptions extends Options {
    all?: true;
}

/**
 * This interface contains additional types added to HistoryRepositoryMixin type
 */
export interface HistoryRepository<
    T extends HistoryEntity,
    Relations extends HistoryEntityRelations
> {
    isUnique(entities: DataObject<T>[], where?: Where<T>): Promise<void>;
}

/**
 * History repository mixin, add CRUD operations supporting history
 */
export function HistoryRepositoryMixin<
    T extends HistoryEntity,
    Relations extends HistoryEntityRelations
>() {
    return function <
        R extends MixinTarget<DefaultCrudRepository<T, string, Relations>>
    >(superClass: R) {
        class MixedRepository extends superClass
            implements HistoryRepository<T, Relations> {
            /**
             * Find ctor unique columns
             * then get entities unique columns values
             * for each unique column, values pair check duplicated values are not existed
             * check the values with column, values pair where count is 0
             * if where existed (update), check updatable count is not more than 1
             */
            isUnique = async (entities: DataObject<T>[], where?: Where<T>) => {
                const ctorUniqueFields = Object.entries(
                    this.entityClass.definition.properties
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
                        throw new EntityUniqueConflictError(
                            this.entityClass,
                            field
                        );
                    }
                }

                const entitiesUniqueFieldsWhere: any = {
                    and: [
                        { endDate: null },
                        {
                            or: entitiesUniqueFields.map(
                                ({ field, items }) => ({
                                    [field]: { inq: items },
                                })
                            ),
                        },
                    ],
                };

                const conflicts = await super.count(entitiesUniqueFieldsWhere);
                if (conflicts.count > 0) {
                    throw new EntityUniqueConflictError(
                        this.entityClass,
                        entitiesUniqueFields.map(({ field }) => field).join(",")
                    );
                }

                if (where) {
                    const updatables = await super.find({ where: where });
                    if (updatables.length > 1) {
                        throw new EntityUniqueConflictError(
                            this.entityClass,
                            entitiesUniqueFields
                                .map(({ field }) => field)
                                .join(",")
                        );
                    }
                }
            };

            /**
             * Check entity unique fields
             * and set `uid`, `beginDate`, `endDate`, `id` to undefined
             * then create entity
             */
            create = async (
                entity: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.create(entity, options);
                }

                await this.isUnique([entity]);

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
             * Check entities unique fields
             * and set `uid`, `beginDate`, `endDate`, `id` to undefined
             * then create entities
             */
            createAll = async (
                entities: DataObject<T>[],
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.createAll(entities, options);
                }

                await this.isUnique(entities);

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
             * Find one entity by filter and {endDate: null}
             */
            findOne = async (filter?: Filter<T>, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.findOne(filter, options);
                }

                return await super.findOne(
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
             * Find one entity by id and {endDate: null}
             */
            findById = async (
                id: string,
                filter?: FilterExcludingWhere<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.findById(id, filter, options);
                }

                return await super.findById(id, filter, options);
            };

            /**
             * Count all entities by where and {endDate: null}
             */
            count = async (where?: Where<T>, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.count(where, options);
                }

                return await super.count({
                    and: [{ endDate: null }, where as any].filter(
                        (condition) => condition
                    ),
                });
            };

            /**
             * Check one entity by id and {endDate: null}
             */
            exists = async (id: string, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.exists(id, options);
                }

                return await super.exists(id, options);
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

                await this.isUnique([data], {
                    and: [{ endDate: null }, where as any].filter(
                        (condition) => condition
                    ),
                });

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
             * Check data unique fields by id and {endDate: null}
             * and get target model by id and {endDate: null}
             * and create updated model with {endDate: null}
             * then update old model and set {endDate: now()}
             */
            updateById = async (
                id: string,
                data: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.updateById(id, data, options);
                }

                await this.isUnique(
                    [data],
                    this.entityClass.buildWhereForId(id)
                );

                const target = await super.findById(id, {}, options);

                await super.create(
                    {
                        ...target,
                        ...data,
                        uid: undefined,
                        beginDate: undefined,
                        endDate: undefined,
                        id: target.id,
                    },
                    options
                );

                await super.updateAll(
                    { endDate: new Date() },
                    {
                        uid: target.uid,
                    } as any,
                    options
                );
            };

            /**
             * Check data unique fields by id and {endDate: null}
             * and get target model by id and {endDate: null}
             * and create updated model with {endDate: null}
             * then update old model and set {endDate: now()}
             */
            update = async (entity: T, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.update(entity, options);
                }

                await this.isUnique(
                    [entity],
                    this.entityClass.buildWhereForId(
                        this.entityClass.getIdOf(entity)
                    )
                );

                const target = await super.findById(
                    this.entityClass.getIdOf(entity),
                    {},
                    options
                );

                await super.create(
                    {
                        ...target,
                        ...entity,
                        uid: undefined,
                        beginDate: undefined,
                        endDate: undefined,
                        id: target.id,
                    },
                    options
                );

                await super.updateAll(
                    { endDate: new Date() },
                    {
                        uid: target.uid,
                    } as any,
                    options
                );
            };

            /**
             * Check data unique fields by id and {endDate: null}
             * and get target model by id and {endDate: null}
             * and create replaced model with {endDate: null}
             * then update old model and set {endDate: now()}
             */
            replaceById = async (
                id: string,
                data: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.all) {
                    return super.replaceById(id, data, options);
                }

                await this.isUnique(
                    [data],
                    this.entityClass.buildWhereForId(id)
                );

                const target = await super.findById(id, {}, options);

                await super.create(
                    {
                        ...data,
                        uid: undefined,
                        beginDate: undefined,
                        endDate: undefined,
                        id: target.id,
                    },
                    options
                );

                await super.updateAll(
                    { endDate: new Date() },
                    {
                        uid: target.uid,
                    } as any,
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
             * Update all entities by id and {endDate: null}, set {endDate: now()}
             */
            delete = async (entity: T, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.delete(entity, options);
                }

                await super.updateAll(
                    { endDate: new Date() },
                    this.entityClass.buildWhereForId(
                        this.entityClass.getIdOf(entity)
                    ),
                    options
                );
            };

            /**
             * Update all entities by id and {endDate: null}, set {endDate: now()}
             */
            deleteById = async (id: string, options?: HistoryOptions) => {
                if (options && options.all) {
                    return super.deleteById(id, options);
                }

                await super.updateAll(
                    { endDate: new Date() },
                    this.entityClass.buildWhereForId(id),
                    options
                );
            };
        }

        return MixedRepository;
    };
}
