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
        defaultFn: "now",
    })
    endDate: Date;

    @property({
        type: "string",
        defaultFn: "uuidv4",
        unique: true,
    })
    id: string;

    constructor(data?: Partial<HistoryEntity>) {
        super(data);
    }
}

export interface HistoryEntityRelations {}

export type HistoryEntityWithRelations = HistoryEntity & HistoryEntityRelations;
