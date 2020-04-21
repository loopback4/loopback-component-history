import { Entity, model, property } from "@loopback/repository";

@model({ settings: {} })
export class HistoryEntity extends Entity {
    @property({
        type: "string",
        id: true,
        required: true,
        defaultFn: "uuidv4",
    })
    uid: string;

    @property({
        type: "date",
        required: true,
        defaultFn: "$now",
    })
    beginDate: Date;

    @property({
        type: "date",
        defaultFn: "$now",
    })
    endDate: Date;

    @property({
        type: "string",
        required: true,
        defaultFn: "uuidv4",
    })
    id: string;

    constructor(data?: Partial<HistoryEntity>) {
        super(data);
    }
}

export interface HistoryEntityRelations {}

export type HistoryEntityWithRelations = HistoryEntity & HistoryEntityRelations;
