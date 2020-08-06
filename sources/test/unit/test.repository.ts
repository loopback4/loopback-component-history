import { Constructor } from "@loopback/core";
import {
    juggler,
    Getter,
    Entity,
    BelongsToAccessor,
    HasOneRepositoryFactory,
    DefaultCrudRepository,
} from "@loopback/repository";

import { HistoryRepositoryMixin } from "../../src";

import { User, Profile } from "./test.model";

export class UserRepository extends HistoryRepositoryMixin<User, {}>()<
    Constructor<DefaultCrudRepository<User, string, {}>>
>(DefaultCrudRepository) {
    public readonly profile: HasOneRepositoryFactory<
        Profile,
        typeof User.prototype.id
    >;
    public readonly parent: BelongsToAccessor<User, typeof User.prototype.id>;

    constructor(
        ctor: typeof Entity & {
            prototype: User;
        },
        dataSource: juggler.DataSource,
        profileRepositoryGetter: Getter<ProfileRepository>
    ) {
        super(ctor, dataSource);

        this.profile = this.createHasOneRepositoryFactoryFor(
            "profile",
            profileRepositoryGetter
        );
        this.registerInclusionResolver(
            "parent",
            this.profile.inclusionResolver
        );

        this.parent = this.createBelongsToAccessorFor(
            "parent",
            Getter.fromValue(this)
        );
        this.registerInclusionResolver("parent", this.parent.inclusionResolver);
    }
}

export class ProfileRepository extends DefaultCrudRepository<
    Profile,
    string,
    {}
> {
    constructor(
        ctor: typeof Entity & {
            prototype: Profile;
        },
        dataSource: juggler.DataSource
    ) {
        super(ctor, dataSource);
    }
}
