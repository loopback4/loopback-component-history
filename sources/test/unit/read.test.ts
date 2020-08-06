import { expect } from "@loopback/testlab";
import { juggler } from "@loopback/repository";

import { User } from "./test.model";
import { UserRepository } from "./test.repository";

describe("Read Model", async () => {
    const datasource: juggler.DataSource = new juggler.DataSource({
        name: "db",
        connector: "memory",
    });
    const userRepository = new UserRepository(User, datasource);

    it("find() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );
        await userRepository.deleteById("1");

        /**
         * Test soft find using where
         */
        expect(
            await userRepository.find({
                where: { username: { inq: ["user1", "user2"] } },
            })
        ).containDeep([
            {
                username: "user2",
                password: "231",
            },
        ]);

        /**
         * Test hard find using where
         */
        expect(
            await userRepository.find(
                {
                    where: { username: { inq: ["user1", "user2"] } },
                },
                { all: true }
            )
        ).containDeep([
            {
                username: "user1",
                password: "123",
            },
            {
                username: "user2",
                password: "231",
            },
        ]);
    });

    it("findOne() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );
        await userRepository.deleteById("1");

        /**
         * Test soft findOne using where
         */
        expect(
            await userRepository.findOne({
                where: { username: "user1" },
            })
        ).containDeep(null);

        /**
         * Test hard findOne using where
         */
        expect(
            await userRepository.findOne(
                {
                    where: { username: "user1" },
                },
                { all: true }
            )
        ).containDeep({
            username: "user1",
            password: "123",
        });
    });

    it("findById() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );
        await userRepository.deleteById("1");

        /**
         * Test soft find by id
         */
        expect(await userRepository.findById("2")).containDeep({
            username: "user2",
            password: "231",
        });

        /**
         * Test hard find by id
         */
        expect(
            await userRepository.findById("x", {}, { all: true })
        ).containDeep({
            username: "user1",
            password: "123",
        });
    });

    it("count() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );
        await userRepository.deleteById("1");

        /**
         * Test soft count using where
         */
        expect(await userRepository.count()).containDeep({
            count: 2,
        });

        /**
         * Test hard count using where
         */
        expect(await userRepository.count({}, { all: true })).containDeep({
            count: 3,
        });
    });

    it("exists() Test", async () => {
        await userRepository.deleteAll({}, { all: true });
        await userRepository.createAll(
            [
                { uid: "x", id: "1", username: "user1", password: "123" },
                { uid: "y", id: "2", username: "user2", password: "231" },
                { uid: "z", id: "3", username: "user3", password: "321" },
            ],
            { all: true }
        );
        await userRepository.deleteById("1");

        /**
         * Test soft exists using where
         */
        expect(await userRepository.exists("1")).equal(false);

        /**
         * Test hard exists using where
         */
        expect(await userRepository.exists("x", { all: true })).equal(true);
    });
});
