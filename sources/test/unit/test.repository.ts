import {
    juggler,
    repository,
    BelongsToAccessor,
    HasOneRepositoryFactory,
    DefaultCrudRepository,
    CrudRepository,
    Getter,
} from "@loopback/repository";

import { HistoryRepositoryMixin } from "../../src";

import { User, Profile } from "./test.model";

export const datasource: juggler.DataSource = new juggler.DataSource({
    name: "db",
    connector: "memory",
});
MixinTarget<CrudRepository>
export class UserRepository extends HistoryRepositoryMixin<User, {}>()<
    DefaultCrudRepository<User, string, {}>
>(DefaultCrudRepository) {
    public readonly parent: BelongsToAccessor<User, typeof User.prototype.id>;

    constructor() {
        super(User, datasource);

        this.parent = this.createBelongsToAccessorFor(
            "parent",
            Getter.fromValue(this)
        );
        this.registerInclusionResolver("parent", this.parent.inclusionResolver);
    }
}
