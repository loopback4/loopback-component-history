import { expect } from "@loopback/testlab";
import { juggler } from "@loopback/repository";

import { User } from "./test.model";
import { UserRepository } from "./test.repository";

describe("Create Model", () => {
    const datasource: juggler.DataSource = new juggler.DataSource({
        name: "db",
        connector: "memory",
    });
    const userRepository = new UserRepository(User, datasource);

    it("create() Test", async () => {
        await userRepository.deleteAll({}, { all: true });

        /**
         * Test create one user without relation
         */
        expect(
            await userRepository.create({ username: "user1", password: "123" })
        ).containDeep({
            endDate: null,
            username: "user1",
            password: "123",
            parentId: undefined,
        });

        /**
         * Test create one user ignoring history props
         */
        expect(
            await userRepository.create({
                uid: "123",
                beginDate: new Date(),
                endDate: new Date(),
                id: "123",
                username: "user2",
                password: "123",
                parentId: "12",
            })
        ).containDeep({
            endDate: null,
            username: "user2",
            password: "123",
            parentId: "12",
        });

        /**
         * Test create one user in all
         */
        expect(
            await userRepository.create(
                {
                    uid: "123",
                    beginDate: new Date(1998, 1, 1),
                    endDate: new Date(1998, 1, 1),
                    id: "123",
                    username: "user3",
                    password: "123",
                    parentId: "12",
                },
                { all: true }
            )
        ).containDeep({
            uid: "123",
            beginDate: new Date(1998, 1, 1),
            endDate: new Date(1998, 1, 1),
            id: "123",
            username: "user3",
            password: "123",
            parentId: "12",
        });
    });

    it("createAll() Test", async () => {
        await userRepository.deleteAll({}, { all: true });

        /**
         * Test create multiple users with different usernames(unique)
         */
        expect(
            await userRepository.createAll([
                { username: "user1", password: "123" },
                { username: "user2", password: "231" },
                { username: "user3", password: "321" },
            ])
        ).containDeep([
            {
                endDate: null,
                username: "user1",
                password: "123",
                parentId: undefined,
            },
            {
                endDate: null,
                username: "user2",
                password: "231",
                parentId: undefined,
            },
            {
                endDate: null,
                username: "user3",
                password: "321",
                parentId: undefined,
            },
        ]);
    });
});
