# loopback-component-history

![checks](https://img.shields.io/github/checks-status/loopback4/loopback-component-history/next)
![npm latest](https://img.shields.io/npm/v/loopback-component-history/latest)
![npm next](https://img.shields.io/npm/v/loopback-component-history/next)
![license](https://img.shields.io/github/license/loopback4/loopback-component-history)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Floopback4%2Floopback-component-history.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Floopback4%2Floopback-component-history?ref=badge_shield)

Saving history of `Create`, `Update`, `Delete` of a table sometimes is a big problem in data model design level.

A good approach for saving history is about adding some columns to your tables:

1. `UID`: A unique record identifier of the history
2. `BeginDate`: Record creation date
3. `EndDate`: Record deletion date
4. `ID`: History of one data is accessable using their same ID

-   Per every `Create` we will create a new record in table
-   Per every `Update` we will invalid last history, create new record
-   Per every `Delete` we will invalid last history

Now, using this simple extension you can add all history features to your models and repositories.

## Installation

Use the package manager [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install `loopback-component-history`.

```bash
npm i --save loopback-component-history
```

## Usage

Follow these steps to add `History` extension to your loopback4 application:

-   Change your model parent class from `Entity` to `HistoryEntity`
-   Remove `id` property from your model declaration

    ```ts
    // Old
    @model()
    export class User extends Entity {
        @property({
            type: "string",
            unique: true,
            id: true,
        })
        id: string;

        @property({
            type: "string",
            default: "",
        })
        username: string;

        constructor(data?: Partial<User>) {
            super(data);
        }
    }

    // New
    import { HistoryEntity } from "loopback-component-history";

    @model()
    export class User extends HistoryEntity {
        @property({
            type: "string",
            default: "",
        })
        username: string;

        constructor(data?: Partial<User>) {
            super(data);
        }
    }
    ```

-   Change your repository parent class from `DefaultCrudRepository` to `HistoryRepositoryMixin()()`

    ```ts
    // Old
    export class UserRepository extends DefaultCrudRepository<
        User,
        typeof User.prototype.id,
        UserRelations
    > {
        // ...
    }

    // New
    import { HistoryRepositoryMixin } from "loopback-component-history";

    export class UserRepository extends HistoryRepositoryMixin<
        User,
        UserRelations
    >()<Constructor<DefaultCrudRepository<User, string, UserRelations>>>(
        DefaultCrudRepository
    ) {
        // ...
    }
    ```

---

### Tip

Don't use `unique` indexes in your models, instead add `unique` property to model definition

Convert your model from:

```ts
export class User extends Entity {
    @property({
        type: "string",
        required: true,
        index: {
            unique: true,
        },
    })
    username: string;
}
```

To:

```ts
export class User extends HistoryEntity {
    @property({
        type: "string",
        required: true,
        unique: true,
    })
    username: string;
}
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

This project is licensed under the [MIT](LICENSE.md).  
Copyright (c) KoLiBer (koliberr136a1@gmail.com)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Floopback4%2Floopback-component-history.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Floopback4%2Floopback-component-history?ref=badge_large)
