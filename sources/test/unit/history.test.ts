describe("Empty Test", () => {
    console.log("Empty test passed!");
});

import { MixinTarget } from "@loopback/core";

class Base {
    base: string;
    getBase() {
        return this.base;
    }
}

interface Y {
    y: string;
    getY(): string;
}
function YMixin(base: MixinTarget<Base>) {
    class Mixin extends base implements Y {
        y: string;
        getY(): string {
            return this.y;
        }
    }

    return Mixin;
}

interface Z {
    z: string;
    getZ(): string;
}
function ZMixin<B extends MixinTarget<Base>>(base: B) {
    class Mixin extends base implements Z {
        z: string;
        getZ(): string {
            return this.z;
        }
    }

    return Mixin;
}


class My extends ZMixin(YMixin(Base)) {}
let my = new My();
my.
// class My extends ZMixin(YMixin(Base)) {}


