import {
    Entity,
    model,
    property,
    belongsTo,
    hasOne,
} from "@loopback/repository";

import { HistoryEntity } from "../../src";

@model()
export class User extends HistoryEntity {
    @property({
        type: "string",
        unique: true,
    })
    username: string;

    @property({
        type: "string",
    })
    password: string;

    @hasOne(() => Profile)
    profile: any;

    @belongsTo(() => User)
    parentId: string;
}

@model()
export class Profile extends Entity {
    @property({
        type: "string",
        defaultFn: "uuidv4",
        id: true,
    })
    id: string;

    @property({
        type: "string",
    })
    name: string;

    @property({
        type: "date",
        defaultFn: "now",
    })
    date: Date;

    @property({
        type: "string",
    })
    userId: string;
}
