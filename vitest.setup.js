// Mock AudioContext for jsdom (not natively supported)
class MockAudioContext {
  constructor() {
    this.destination = { getContext: () => null, addEventListener: () => {} }
    this.createGain = () => ({ connect: () => this, gain: { value: 1 } })
    this.createOscillator = () => {
      const osc = {
        connect: () => this,
        start: () => {},
        stop: () => {},
        onended: null
      }
      setTimeout(() => { if (osc.onended) osc.onended() }, 0)
      return osc
    }
  }
  close() { return Promise.resolve() }
}

if (typeof window !== 'undefined') {
  window.AudioContext = MockAudioContext
  window.webkitAudioContext = MockAudioContext
}
