# loopback-component-history

[![LoopBack](https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install HistoryComponent using `npm`;

```sh
$ npm install loopback-component-history
```

## Basic Use

Configure and load HistoryComponent in the application constructor
as shown below.

```ts
import {HistoryComponent, HistoryComponentOptions, DEFAULT_LOOPBACK_COMPONENT_HISTORY_OPTIONS} from 'loopback-component-history';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: HistoryComponentOptions = DEFAULT_LOOPBACK_COMPONENT_HISTORY_OPTIONS;
    this.configure(HistoryComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(HistoryComponent);
    // ...
  }
  // ...
}
```
