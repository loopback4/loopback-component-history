import { model, property, belongsTo } from "@loopback/repository";

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

    @belongsTo(() => User)
    parentId: string;

    constructor(data?: Partial<User>) {
        super(data);
    }
}
