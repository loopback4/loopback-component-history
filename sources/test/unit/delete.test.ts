import { expect } from "@loopback/testlab";
import { juggler } from "@loopback/repository";

import { User, Profile } from "./test.model";
import { UserRepository, ProfileRepository } from "./test.repository";

describe("Delete Model", () => {
    const datasource: juggler.DataSource = new juggler.DataSource({
        name: "db",
        connector: "memory",
    });
    const profileRepository = new ProfileRepository(Profile, datasource);
    const userRepository = new UserRepository(
        User,
        datasource,
        async () => profileRepository
    );

    it("deleteAll() Test", async () => {
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
         * Test soft delete two users using where
         */
        await userRepository.deleteAll({
            username: { inq: ["user1", "user2"] },
        });
        expect(await userRepository.count({})).deepEqual({
            count: 1,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });

        /**
         * Test hard delete two users using where
         */
        await userRepository.deleteAll(
            {
                username: { inq: ["user1", "user2"] },
            },
            { all: true }
        );
        expect(await userRepository.count({})).deepEqual({
            count: 1,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 1,
        });
    });

    it("delete() Test", async () => {
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
         * Test soft delete one user using entity
         */
        await userRepository.delete(new User({ id: "1" }));
        expect(await userRepository.count({})).deepEqual({
            count: 2,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });

        /**
         * Test hard delete one user using entity
         */
        await userRepository.delete(new User({ uid: "x" }), { all: true });
        expect(await userRepository.count({})).deepEqual({
            count: 2,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 2,
        });
    });

    it("deleteById() Test", async () => {
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
         * Test soft delete one user using id
         */
        await userRepository.deleteById("1");
        expect(await userRepository.count({})).deepEqual({
            count: 2,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 3,
        });

        /**
         * Test hard delete one user using id
         */
        await userRepository.deleteById("x", { all: true });
        expect(await userRepository.count({})).deepEqual({
            count: 2,
        });
        expect(await userRepository.count({}, { all: true })).deepEqual({
            count: 2,
        });
    });
});
