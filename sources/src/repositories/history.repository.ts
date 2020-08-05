import { MixinTarget, Constructor } from "@loopback/core";
import {
    DefaultCrudRepository,
    DataObject,
    Options,
    Filter,
    FilterExcludingWhere,
    Where,
    EntityNotFoundError,
    Model,
    Entity,
} from "@loopback/repository";

import { Ctor } from "../types";

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
 * Repository Mixin
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
            isUnique = async (entities: DataObject<T>[], where?: Where<T>) => {
                const ctorUniqueFields = Object.entries(
                    this.entityClass.definition.properties
                )
                    .filter(
                        ([_, definition]) => this.entityClass.definition.unique
                    )
                    .map(([fieldName, _]) => fieldName);

                const entitiesUniqueFields = ctorUniqueFields
                    .map((fieldName) =>
                        entities.map<string>((entity: any) => entity[fieldName])
                    )
                    .filter((field) => field);

                // const hasDuplicateUniqueFields = entitiesUniqueFields
                //     .map(
                //         (fields) =>
                //             Object.values(
                //                 fields.reduce<{ [key: string]: number }>(
                //                     (prev, item) => ({
                //                         ...prev,
                //                         [item]: (prev.item || 0) + 1,
                //                     }),
                //                     {}
                //                 )
                //             ).filter((fieldsCount) => fieldsCount > 1).length > 0
                //     )
                //     .reduce((prev, hasDuplicate) => prev || hasDuplicate, false);

                // if (hasDuplicateUniqueFields) {
                //     throw new EntityUniqueConflictError(
                //         this.entityClass,
                //         modelUniquesFields
                //     );
                // }

                // /**
                //  * 2. count(and: [
                //  *          {endDate:null},
                //  *          {or: [unique(x),unique(y),unique(z)]}
                //  *    ]) == 0
                //  */
                // const uniqueConditions = modelUniquesFields
                //     .map((fieldName, index) => ({
                //         fieldName: fieldName,
                //         fields: entitiesUniquesFields[index],
                //     }))
                //     .filter(({ fields }) => fields.length > 0)
                //     .map(({ fieldName, fields }) => ({
                //         [fieldName]: { inq: fields },
                //     }));

                // if (uniqueConditions.length > 0) {
                //     const uniqueFieldsCount = await super.count({
                //         and: [{ endDate: null }, { or: uniqueConditions }] as any,
                //     });

                //     if (uniqueFieldsCount.count > 0) {
                //         throw new EntityUniqueConflictError(
                //             this.entityClass,
                //             modelUniquesFields
                //         );
                //     }
                // }

                // const uniqueConditions = modelUniquesFields
                //     .map((fieldName) => ({
                //         fieldName: fieldName,
                //         field: (data as any)[fieldName],
                //     }))
                //     .filter(({ field }) => field)
                //     .map(({ fieldName, field }) => ({
                //         [fieldName]: field,
                //     }));

                // if (uniqueConditions.length > 0) {
                //     const uniqueFieldsCount = await super.count({
                //         and: [{ endDate: null }, { or: uniqueConditions }] as any,
                //     });

                //     if (uniqueFieldsCount.count > 0) {
                //         throw new EntityUniqueConflictError(
                //             this.entityClass,
                //             modelUniquesFields
                //         );
                //     }
                // }

                // /**
                //  * 2. if (count(and: [
                //  *          {endDate: null},
                //  *          where
                //  *    ]) > 1) => unique(x).length == 0
                //  */
                // const targetCount = await super.count(where as any);

                // if (targetCount.count > 1 && modelUniquesFields.length > 0) {
                //     throw new EntityUniqueConflictError(
                //         this.entityClass,
                //         modelUniquesFields
                //     );
                // }
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

// class A extends HistoryRepositoryMixin<HistoryEntity, {}>()<
//     Constructor<DefaultCrudRepository<HistoryEntity, string, {}>>
// >(DefaultCrudRepository) {}

// let a: A;
// a.find();
