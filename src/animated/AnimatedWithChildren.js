import Animated from './Animated'

const getValues = object => Object.keys(object).map(k => object[k])

export default class AnimatedWithChildren extends Animated {
  children = []

  addChild(child) {
    if (this.children.length === 0) this.attach()
    this.children.push(child)
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    if (index === -1) {
      if (process.env.NODEENV !== 'production') {
        console.warn("Trying to remove a child that doesn't exist")
      }
      return
    }
    this.children.splice(index, 1)
    if (this.children.length === 0) this.detach()
  }

  getChildren = () => this.children
}

export class AnimatedArrayWithChildren extends AnimatedWithChildren {
  payload = []
  attach = () =>
    this.payload.forEach(p => p instanceof Animated && p.addChild(this))
  detach = () =>
    this.payload.forEach(p => p instanceof Animated && p.removeChild(this))
}

export class AnimatedObjectWithChildren extends AnimatedWithChildren {
  payload = {}
  getValue(animated = false) {
    const payload = {}
    for (const key in this.payload) {
      const value = this.payload[key]
      if (animated && !(value instanceof Animated)) continue
      payload[key] =
        value instanceof Animated
          ? value[animated ? 'getAnimatedValue' : 'getValue']()
          : value
    }
    return payload
  }
  getAnimatedValue = () => this.getValue(true)
  attach = () =>
    getValues(this.payload).forEach(
      s => s instanceof Animated && s.addChild(this)
    )
  detach = () =>
    getValues(this.payload).forEach(
      s => s instanceof Animated && s.removeChild(this)
    )
}
