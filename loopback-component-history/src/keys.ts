import {BindingKey, CoreBindings} from '@loopback/core';
import {HistoryComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace HistoryComponentBindings {
  export const COMPONENT = BindingKey.create<HistoryComponent>(
    `${CoreBindings.COMPONENTS}.HistoryComponent`,
  );
}
