export * from "./types";

export * from "./errors";
export * from "./models";
export * from "./repositories";

import { HistoryEntity } from "./models";

console.log(
    Object.entries(HistoryEntity.definition.properties)
        .filter(([_, definition]) => definition.unique)
        .map(([fieldName, _]) => fieldName)
);
