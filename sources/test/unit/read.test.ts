import { expect } from "@loopback/testlab";
import { juggler } from "@loopback/repository";

import { User, Profile } from "./test.model";
import { UserRepository, ProfileRepository } from "./test.repository";

describe("Read Model", () => {
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
        // await userRepository.updateById("2", { username: "userX" });

        // /**
        //  * Test soft find using where
        //  */
        // expect(
        //     await await userRepository.find({
        //         where: { username: { inq: ["user1", "user2"] } },
        //     })
        // ).deepEqual([]);

        /**
         * Test hard find using where
         */
    });
});
