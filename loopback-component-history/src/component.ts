import {
  Application,
  injectable,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
} from '@loopback/core';
import {HistoryComponentBindings} from './keys'
import {DEFAULT_LOOPBACK_COMPONENT_HISTORY_OPTIONS, HistoryComponentOptions} from './types';

// Configure the binding for HistoryComponent
@injectable({tags: {[ContextTags.KEY]: HistoryComponentBindings.COMPONENT}})
export class HistoryComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: HistoryComponentOptions = DEFAULT_LOOPBACK_COMPONENT_HISTORY_OPTIONS,
  ) {}
}
