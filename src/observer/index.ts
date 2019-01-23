import { is, hasOwn } from '../utils'
import Dependency from './dependeny'
import Watcher from './watcher'
import Proxy from './polyfill/proxy'
import Reflect from './polyfill/reflect'

export default function observe(data: any, specificWatcher: Watcher = null) {
  if (is.function(data)) {
    throw new Error('function can\'t be observed')
  } else if (!is.object(data) && !is.array(data)) {
    data = { value: data }
  }
  for (const key in data) {
    if (hasOwn(data, key)) {
      if (is.object(data[key]) || is.array(data[key])) {
        data[key] = observe(data[key], specificWatcher)
      }
    }
  }
  const dep: Dependency = new Dependency(specificWatcher)
  const handler: ProxyHandler<any> = {
    get(target, property) {
      if (hasOwn(target, property)) {
        // collect dependencies
        dep.collect()
      }
      return Reflect.get(target, property)
    },
    set(target, property, value) {
      if (
        (hasOwn(target, property) || is.undefined(target[property])) &&
        value !== target[property]
      ) {
        // notify watchers
        dep.notify()
      }
      return Reflect.set(target, property, value)
    },
    defineProperty(target, property, descriptor) {
      if (
        (hasOwn(target, property) || is.undefined(target[property])) &&
        descriptor.value !== target[property]
      ) {
        // notify watchers
        dep.notify()
      }
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      if (hasOwn(target, property)) {
        // notify watchers
        dep.notify()
      }
      return Reflect.deleteProperty(target, property)
    }
  }
  return new Proxy(data, handler)
}