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
    @property()
    username: string;

    @property()
    password: string;

    @hasOne(() => Profile)
    profile: any;

    @belongsTo(() => User)
    parentId: string;
}

@model()
export class Profile extends Entity {
    @property()
    id: string;

    @property()
    name: string;

    @property()
    date: Date;

    @belongsTo(() => Profile)
    parentId: any;
}
