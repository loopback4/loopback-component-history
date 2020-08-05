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
    history?: true;
    maxDate?: Date;
}

/**
 * This interface contains additional types added to HistoryRepositoryMixin type
 */
export interface HistoryRepository<
    T extends HistoryEntity,
    Relations extends HistoryEntityRelations
> {}

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
            // private async createUnique(entities: DataObject<Model>[]) {
            //     /**
            //      * 1. duplicate(unique(x),unique(y),unique(z)) == false
            //      */
            //     const modelUniquesFields = Object.entries(
            //         this.entityClass.definition.properties
            //     )
            //         .filter(([_, definition]) => definition.unique)
            //         .map(([fieldName, _]) => fieldName);

            //     const entitiesUniquesFields = modelUniquesFields
            //         .map((fieldName) =>
            //             entities.map<string>((entity: any) => entity[fieldName])
            //         )
            //         .filter((field) => field);

            //     const hasDuplicateUniqueFields = entitiesUniquesFields
            //         .map(
            //             (fields) =>
            //                 Object.values(
            //                     fields.reduce<{ [key: string]: number }>(
            //                         (prev, item) => ({
            //                             ...prev,
            //                             [item]: (prev.item || 0) + 1,
            //                         }),
            //                         {}
            //                     )
            //                 ).filter((fieldsCount) => fieldsCount > 1).length >
            //                 0
            //         )
            //         .reduce(
            //             (prev, hasDuplicate) => prev || hasDuplicate,
            //             false
            //         );

            //     if (hasDuplicateUniqueFields) {
            //         throw new EntityUniqueConflictError(
            //             this.entityClass,
            //             modelUniquesFields
            //         );
            //     }

            //     /**
            //      * 2. count(and: [
            //      *          {endDate:null},
            //      *          {or: [unique(x),unique(y),unique(z)]}
            //      *    ]) == 0
            //      */
            //     const uniqueConditions = modelUniquesFields
            //         .map((fieldName, index) => ({
            //             fieldName: fieldName,
            //             fields: entitiesUniquesFields[index],
            //         }))
            //         .filter(({ fields }) => fields.length > 0)
            //         .map(({ fieldName, fields }) => ({
            //             [fieldName]: { inq: fields },
            //         }));

            //     if (uniqueConditions.length > 0) {
            //         const uniqueFieldsCount = await super.count({
            //             and: [
            //                 { endDate: null },
            //                 { or: uniqueConditions },
            //             ] as any,
            //         });

            //         if (uniqueFieldsCount.count > 0) {
            //             throw new EntityUniqueConflictError(
            //                 this.entityClass,
            //                 modelUniquesFields
            //             );
            //         }
            //     }
            // }

            // private async createHistory(
            //     entities: DataObject<Model>[],
            //     options?: HistoryOptions
            // ): Promise<Model[]> {
            //     /**
            //      * create(uid:null,beginDate:$now,endDate:null,id:null)
            //      */
            //     const date = new Date();

            //     return await super.createAll(
            //         entities.map((entity) => ({
            //             ...entity,
            //             uid: undefined,
            //             beginDate: date,
            //             endDate: null,
            //             id: undefined,
            //         })),
            //         options
            //     );
            // }

            // private async findHistory(
            //     group: boolean,
            //     filter: Filter,
            //     options?: HistoryOptions
            // ): Promise<(Model & ModelRelations)[]> {
            //     /**
            //      * where: {id:id,endDate<=date|endDate:null}
            //      * select(where)
            //      * group(beginDate:last)
            //      */
            //     let result = await super.find(filter as any, options);

            //     if (group) {
            //         // find last entities group by id and save last entities in object
            //         let lastEntities: any = {};
            //         result.forEach((entity) => {
            //             if (
            //                 !lastEntities[entity.id] ||
            //                 lastEntities[entity.id].beginDate < entity.beginDate
            //             ) {
            //                 lastEntities[entity.id] = entity;
            //             }
            //         });

            //         // filter only last entity of every group (by id)
            //         result = result.filter(
            //             (entity) => lastEntities[entity.id].uid === entity.uid
            //         );
            //     }

            //     return result;
            // }

            // private async updateUnique(data: DataObject<Model>, where: Where) {
            //     /**
            //      * 1. count(and: [
            //      *          {endDate:null},
            //      *          unique(x)
            //      *    ]) == 0
            //      */
            //     const modelUniquesFields = Object.entries(
            //         this.entityClass.definition.properties
            //     )
            //         .filter(([_, definition]) => definition.unique)
            //         .map(([fieldName, _]) => fieldName);

            //     const uniqueConditions = modelUniquesFields
            //         .map((fieldName) => ({
            //             fieldName: fieldName,
            //             field: (data as any)[fieldName],
            //         }))
            //         .filter(({ field }) => field)
            //         .map(({ fieldName, field }) => ({
            //             [fieldName]: field,
            //         }));

            //     if (uniqueConditions.length > 0) {
            //         const uniqueFieldsCount = await super.count({
            //             and: [
            //                 { endDate: null },
            //                 { or: uniqueConditions },
            //             ] as any,
            //         });

            //         if (uniqueFieldsCount.count > 0) {
            //             throw new EntityUniqueConflictError(
            //                 this.entityClass,
            //                 modelUniquesFields
            //             );
            //         }
            //     }

            //     /**
            //      * 2. if (count(and: [
            //      *          {endDate: null},
            //      *          where
            //      *    ]) > 1) => unique(x).length == 0
            //      */
            //     const targetCount = await super.count(where as any);

            //     if (targetCount.count > 1 && modelUniquesFields.length > 0) {
            //         throw new EntityUniqueConflictError(
            //             this.entityClass,
            //             modelUniquesFields
            //         );
            //     }
            // }

            // private async updateHistory(
            //     data: DataObject<Model>,
            //     replace: boolean,
            //     where: Where,
            //     options?: HistoryOptions
            // ): Promise<Count> {
            //     /**
            //      * where: {id:id,endDate:null}
            //      * select(where)
            //      * create(uid:null,beginDate:$now,endDate:null)
            //      * update(where) => endDate: $now
            //      */
            //     const date = new Date();

            //     const entities = await super.find(
            //         {
            //             where: where as any,
            //         },
            //         options
            //     );

            //     await super.createAll(
            //         entities.map((entity) => ({
            //             ...(replace ? {} : entity),
            //             ...data,
            //             uid: undefined,
            //             beginDate: date,
            //             endDate: null,
            //             id: entity.id,
            //         })),
            //         options
            //     );

            //     return await super.updateAll(
            //         { endDate: date },
            //         {
            //             uid: { inq: entities.map((entity) => entity.uid) },
            //         } as any,
            //         options
            //     );
            // }

            // private async deleteHistory(
            //     where: Where,
            //     options?: HistoryOptions
            // ): Promise<Count> {
            //     /**
            //      * where: {id:id,endDate:null}
            //      * update(where) => endDate: $now
            //      */
            //     return await super.updateAll(
            //         { endDate: new Date() },
            //         where as any,
            //         options
            //     );
            // }

            /**
             * Create one entity:
             *  1. Check unique fields
             *  2.
             */
            create = async (
                entity: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.history) {
                    return super.create(entity, options);
                }

                await this.createUnique([entity]);

                return super.create({
                    ...entity,
                    uid: undefined,
                    beginDate: 
                }, options);
            };
            createAll = async (
                entities: DataObject<T>[],
                options?: HistoryOptions
            ) => {
                if (options && options.history) {
                    return super.createAll(entities, options);
                }

                await this.createUnique(entities);

                return await this.createHistory(entities, options);
            };

            find = async (filter?: Filter<T>, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.find(filter, options);
                }


                const maxDate = options && options.maxDate;
                const maxDateCondition = maxDate ? { lt: maxDate } : null;

                /** Create history filter by endDate, id */
                let historyFilter;
                if (filter && filter.where) {
                    historyFilter = {
                        ...filter,
                        where: {
                            and: [{ endDate: maxDateCondition }, filter.where],
                        },
                    };
                } else {
                    historyFilter = {
                        ...filter,
                        where: { endDate: maxDateCondition },
                    };
                }

                return await this.findHistory(
                    Boolean(maxDate),
                   
            };
            findOne = async (filter?: Filter<T>, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.findOne(filter, options);
                }



                const maxDate = options && options.maxDate;
                const maxDateCondition = maxDate ? { lt: maxDate } : null;

                /** Create history filter by endDate, id */
                let historyFilter;
                if (filter && filter.where) {
                    historyFilter = {
                        ...filter,
                        where: {
                            and: [{ endDate: maxDateCondition }, filter.where],
                        },
                    };
                } else {
                    historyFilter = {
                        ...filter,
                        where: { endDate: maxDateCondition },
                    };
                }

                const result = await this.findHistory(
                    Boolean(maxDate),
                    historyFilter,
                    options
                );

                if (result[0]) {
                    return result[0];
                }
                return null;
            };
            findById = async (
                id: string,
                filter?: FilterExcludingWhere<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.history) {
                    return super.findById(id, filter, options);
                }


                const maxDate = options && options.maxDate;
                const maxDateCondition = maxDate ? { lt: maxDate } : null;

                /** Create history filter by endDate, id */
                let historyFilter;
                if (filter && filter.where) {
                    historyFilter = {
                        ...filter,
                        where: {
                            and: [
                                {
                                    id: id,
                                    endDate: maxDateCondition,
                                },
                                filter.where,
                            ],
                        },
                    };
                } else {
                    historyFilter = {
                        ...filter,
                        where: {
                            id: id,
                            endDate: maxDateCondition,
                        },
                    };
                }

                const result = await this.findHistory(
                    Boolean(maxDate),
                    historyFilter,
                    options
                );

                if (result[0]) {
                    return result[0];
                }
                throw new EntityNotFoundError(this.entityClass, id);
            };
            count = (where?: Where<T>, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.count(where, options);
                }


                const maxDate = options && options.maxDate;
                const maxDateCondition = maxDate ? { lt: maxDate } : null;

                /** Create history filter by endDate, id */
                let historyFilter;
                if (where) {
                    historyFilter = {
                        where: {
                            and: [{ endDate: maxDateCondition }, where],
                        },
                    };
                } else {
                    historyFilter = {
                        where: { endDate: maxDateCondition },
                    };
                }

                const result = await this.findHistory(
                    Boolean(maxDate),
                    historyFilter,
                    options
                );

                return {
                    count: result.length,
                };
            };
            exists = (id: string, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.exists(id, options);
                }


                const maxDate = options && options.maxDate;
                const maxDateCondition = maxDate ? { lt: maxDate } : null;

                /** Create history filter by endDate, id */
                let historyFilter = {
                    where: {
                        id: id,
                        endDate: maxDateCondition,
                    },
                };

                const result = await this.findHistory(
                    Boolean(maxDate),
                    historyFilter,
                    options
                );

                if (result[0]) {
                    return true;
                }
                return false;
            };

            updateAll = (
                data: DataObject<T>,
                where?: Where<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.history) {
                    return super.updateAll(data, where, options);
                }


                let historyFilter;
                if (where) {
                    historyFilter = { and: [{ endDate: null }, where] };
                } else {
                    historyFilter = { endDate: null };
                }

                await this.updateUnique(data, historyFilter);

                return await this.updateHistory(
                    data,
                    false,
                    historyFilter,
                    options
                );
            };
            updateById = (
                id: string,
                data: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.history) {
                    return super.updateById(id, data, options);
                }


                let historyFilter = {
                    id: id,
                    endDate: null,
                };

                await this.updateUnique(data, historyFilter);

                await this.updateHistory(data, false, historyFilter, options);
            };
            update = async (entity: T, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.update(entity, options);
                }

                let historyFilter = {
                    id: entity.id,
                    endDate: null,
                };

                await this.updateUnique(entity, historyFilter);

                await this.updateHistory(entity, false, historyFilter, options);
            };
            replaceById = (
                id: string,
                data: DataObject<T>,
                options?: HistoryOptions
            ) => {
                if (options && options.history) {
                    return super.replaceById(id, data, options);
                }


                let historyFilter = {
                    id: id,
                    endDate: null,
                };

                await this.updateUnique(data, historyFilter);

                await this.updateHistory(data, true, historyFilter, options);
            };

            deleteAll = (where?: Where<T>, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.deleteAll(where, options);
                }


                let historyFilter;
                if (where) {
                    historyFilter = { and: [{ endDate: null }, where] };
                } else {
                    historyFilter = { endDate: null };
                }

                return await this.deleteHistory(historyFilter, options);
            };
            delete = async (entity: T, options?: HistoryOptions) => {
                if (options && options.history) {
                    return super.delete(entity, options);
                }

                await super.updateAll(
                    { endDate: new Date() },
                    this.entityClass.buildWhereForId(entity.getId()),
                    options
                );
            };
            deleteById = async (id: string, options?: HistoryOptions) => {
                if (options && options.history) {
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

class X extends HistoryRepositoryMixin<HistoryEntity, {}>()<
    Constructor<DefaultCrudRepository<HistoryEntity, string, {}>>
>(DefaultCrudRepository) {}
