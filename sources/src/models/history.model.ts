import { Entity, model, property } from "@loopback/repository";

@model()
export class HistoryEntity extends Entity {
    @property({
        type: "string",
        defaultFn: "uuidv4",
        id: true,
    })
    uid: string;

    @property({
        type: "date",
        defaultFn: "now",
    })
    beginDate: Date;

    @property({
        type: "date",
        default: null,
    })
    endDate: Date;

    @property({
        type: "string",
        defaultFn: "uuidv4",
        index: true,
    })
    id: string;

    static getIdProperties() {
        return ["id"];
    }

    static getIdOf(entityOrData: HistoryEntity) {
        return entityOrData.id;
    }

    static buildWhereForId(id: any) {
        return {
            id: id,
            endDate: null,
        };
    }

    constructor(data?: Partial<HistoryEntity>) {
        super(data);
    }
}

export interface HistoryEntityRelations {}

export type HistoryEntityWithRelations = HistoryEntity & HistoryEntityRelations;
