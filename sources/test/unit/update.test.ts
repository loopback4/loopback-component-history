import { expect } from "@loopback/testlab";
import { juggler } from "@loopback/repository";

import { User } from "./test.model";
import { UserRepository } from "./test.repository";

describe("Update Model", () => {
    const datasource: juggler.DataSource = new juggler.DataSource({
        name: "db",
        connector: "memory",
    });
    const userRepository = new UserRepository(User, datasource);

    it("updateAll() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );

        /**
         * Test hard update two users using where
         */
        await userRepository.updateAll(
            { password: "111" },
            {
                username: { inq: ["user1", "user2"] },
            },
            { all: true }
        );
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });
        expect(
            await userRepository.findOne({
                where: { username: "user1" },
            })
        ).containDeep({
            username: "user1",
            password: "111",
        });

        /**
         * Test soft update two users using where
         */
        await userRepository.updateAll(
            { password: "222" },
            {
                username: { inq: ["user1", "user2"] },
            }
        );
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 5,
        });
        expect(
            await userRepository.findOne({
                where: { username: "user1" },
            })
        ).containDeep({
            username: "user1",
            password: "222",
        });
    });

    it("update() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );

        /**
         * Test hard update one user using entity
         */
        await userRepository.update(new User({ uid: "x", password: "111" }), {
            all: true,
        });
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });
        expect(
            await userRepository.findOne({
                where: { uid: "x" },
            })
        ).containDeep({
            uid: "x",
            username: "user1",
            password: "111",
        });

        /**
         * Test soft update one user using entity
         */
        await userRepository.update(new User({ id: "1", password: "222" }));
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 4,
        });
        expect(
            await userRepository.findOne({
                where: { id: "1" },
            })
        ).containDeep({
            id: "1",
            username: "user1",
            password: "222",
        });
    });

    it("updateById() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );

        /**
         * Test hard update one user by id
         */
        await userRepository.updateById(
            "x",
            { password: "111" },
            {
                all: true,
            }
        );
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });
        expect(
            await userRepository.findOne({
                where: { uid: "x" },
            })
        ).containDeep({
            uid: "x",
            username: "user1",
            password: "111",
        });

        /**
         * Test soft update one user by id
         */
        await userRepository.updateById("1", { password: "222" });
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 4,
        });
        expect(
            await userRepository.findOne({
                where: { id: "1" },
            })
        ).containDeep({
            id: "1",
            username: "user1",
            password: "222",
        });
    });

    it("replaceById() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );

        /**
         * Test hard replace one user by id
         */
        await userRepository.replaceById(
            "x",
            { password: "111" },
            {
                all: true,
            }
        );
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });
        expect(
            await userRepository.findOne({
                where: { uid: "x" },
            })
        ).containDeep({
            uid: "x",
            username: undefined,
            password: "111",
        });

        /**
         * Test soft replace one user by id
         */
        await userRepository.replaceById("2", { password: "222" });
        expect(await userRepository.count({})).deepEqual({
            count: 3,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 4,
        });
        expect(
            await userRepository.findOne({
                where: { id: "2" },
            })
        ).containDeep({
            id: "2",
            username: undefined,
            password: "222",
        });
    });
});
