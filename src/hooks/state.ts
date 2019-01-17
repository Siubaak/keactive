import observe from '../observer/index'
import Dependency from '../observer/dependeny'
import { is } from '../utils'

export default function useState(state: any) {
  if (!is.object(state) && !is.array(state)) {
    throw new Error('useState only accepts object or array')
  } else if (!Dependency.target) {
    throw new Error('please call useState at top level in a component')
  } else {
    const instance = Dependency.target.instance
    if (!instance.id) {
      // if the component is mounting, it won't have an id
      instance.states.push(observe(state))
    }

    const currentState = instance.currentState
    if (!currentState) {
      throw new Error('unmatch any states. please don\'t call useState in if/loop statement')
    } else {
      return currentState
    }
  }
}