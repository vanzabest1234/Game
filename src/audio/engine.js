// All sound is synthesised at runtime — no audio files.
// Wind + electrical hum are always present; the drone, static bed and heartbeat
// scale with the interference meter. Callers are spoken with the browser's
// speech engine, pitched per character, over a radio static bed.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.muted = false
    this.ready = false
    this.voice = null
    this.heartTimer = null
    this.heartOn = false
  }

  async start() {
    if (this.ready) {
      if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume()
      return
    }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    this.ctx = new Ctx()
    const ctx = this.ctx

    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.85
    this.master.connect(ctx.destination)

    // 3s of noise, reused everywhere.
    const len = Math.floor(ctx.sampleRate * 3)
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1
    this.noiseBuffer = buffer

    // --- Wind: low-passed noise with a slow filter sweep.
    const wind = ctx.createBufferSource()
    wind.buffer = buffer
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 420
    windFilter.Q.value = 0.7
    const windGain = ctx.createGain()
    windGain.gain.value = 0.22
    wind.connect(windFilter).connect(windGain).connect(this.master)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 240
    lfo.connect(lfoGain).connect(windFilter.frequency)

    // --- Static bed: high-passed noise, gain follows interference.
    const staticSrc = ctx.createBufferSource()
    staticSrc.buffer = buffer
    staticSrc.loop = true
    const staticFilter = ctx.createBiquadFilter()
    staticFilter.type = 'highpass'
    staticFilter.frequency.value = 1600
    const staticGain = ctx.createGain()
    staticGain.gain.value = 0.0
    staticSrc.connect(staticFilter).connect(staticGain).connect(this.master)

    // --- Drone: two detuned saws under a low-pass.
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.0
    const droneFilter = ctx.createBiquadFilter()
    droneFilter.type = 'lowpass'
    droneFilter.frequency.value = 180
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = 41
    const osc2 = ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = 41.7
    osc1.connect(droneFilter)
    osc2.connect(droneFilter)
    droneFilter.connect(droneGain).connect(this.master)

    // --- Relay room hum.
    const hum = ctx.createOscillator()
    hum.type = 'sine'
    hum.frequency.value = 59.4
    const humGain = ctx.createGain()
    humGain.gain.value = 0.018
    hum.connect(humGain).connect(this.master)

    ;[wind, lfo, staticSrc, osc1, osc2, hum].forEach((n) => n.start())

    this.nodes = { windGain, staticGain, droneGain, droneFilter, windFilter }
    this.ready = true
    this.setTension(0.08)
    this.pickVoice()
  }

  pickVoice() {
    if (!window.speechSynthesis) return
    const choose = () => {
      const voices = window.speechSynthesis.getVoices() || []
      const en = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
      this.voice =
        en.find((v) => /google us english/i.test(v.name)) ||
        en.find((v) => /samantha|daniel|alex|karen|serena/i.test(v.name)) ||
        en[0] ||
        voices[0] ||
        null
    }
    choose()
    window.speechSynthesis.onvoiceschanged = choose
  }

  setMuted(muted) {
    this.muted = muted
    if (!this.ctx) return
    this.master.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.15)
    if (muted) this.cancelSpeech()
  }

  setTension(t) {
    this.tension = clamp(t, 0, 1)
    if (!this.ctx || !this.nodes) return
    const now = this.ctx.currentTime
    const { staticGain, droneGain, droneFilter, windFilter } = this.nodes
    staticGain.gain.setTargetAtTime(0.004 + this.tension * 0.055, now, 1.2)
    droneGain.gain.setTargetAtTime(this.tension * 0.1, now, 1.5)
    droneFilter.frequency.setTargetAtTime(150 + this.tension * 120, now, 2)
    windFilter.frequency.setTargetAtTime(360 + this.tension * 320, now, 3)

    const shouldBeat = this.tension > 0.6
    if (shouldBeat && !this.heartOn) this.startHeart()
    if (!shouldBeat && this.heartOn) this.stopHeart()
  }

  startHeart() {
    if (this.heartTimer || !this.ctx) return
    this.heartOn = true
    const thump = () => {
      if (!this.ctx) return
      const t = this.ctx.currentTime
      this.blip(52, 0.12, 0.22, t)
      this.blip(46, 0.1, 0.16, t + 0.24)
    }
    thump()
    this.heartTimer = setInterval(thump, 1250)
  }

  stopHeart() {
    this.heartOn = false
    if (this.heartTimer) clearInterval(this.heartTimer)
    this.heartTimer = null
  }

  blip(freq, dur, level, at) {
    if (!this.ctx) return
    const t = at ?? this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(level, t + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  burst(duration = 0.5, level = 0.35) {
    if (!this.ctx || !this.noiseBuffer) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.6
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(level, t + 0.02)
    g.gain.setTargetAtTime(0, t + duration * 0.5, duration * 0.3)
    src.connect(filter).connect(g).connect(this.master)
    src.start(t)
    src.stop(t + duration + 0.3)
  }

  ring() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    // North-American ringback: 440+480 Hz, two seconds on, one off.
    for (let i = 0; i < 2; i += 1) {
      const start = t + i * 3.2
      ;[440, 480].forEach((f) => this.blip(f, 1.9, 0.06, start))
    }
  }

  connectCall() {
    if (!this.ctx) return
    this.burst(0.18, 0.16)
    this.blip(1200, 0.05, 0.05)
  }

  hangUp() {
    if (!this.ctx) return
    this.burst(0.12, 0.1)
    this.blip(320, 0.12, 0.05)
  }

  correct() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.blip(392, 0.5, 0.05, t)
    this.blip(523, 0.7, 0.04, t + 0.16)
  }

  wrong() {
    if (!this.ctx) return
    this.burst(0.9, 0.3)
    const t = this.ctx.currentTime
    this.blip(88, 1.4, 0.12, t)
    this.blip(62, 1.8, 0.1, t + 0.1)
  }

  knock() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    ;[0, 0.34, 0.68].forEach((d) => {
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(120, t + d)
      osc.frequency.exponentialRampToValueAtTime(60, t + d + 0.12)
      g.gain.setValueAtTime(0.16, t + d)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.18)
      osc.connect(g).connect(this.master)
      osc.start(t + d)
      osc.stop(t + d + 0.25)
    })
  }

  speak(text, voice = {}) {
    if (this.muted || !window.speechSynthesis) return
    const clean = text.replace(/\[[^\]]*\]/g, '').trim()
    if (!clean) return
    try {
      const u = new SpeechSynthesisUtterance(clean)
      if (this.voice) u.voice = this.voice
      u.lang = 'en-US'
      u.rate = voice.rate ?? 0.98
      u.pitch = voice.pitch ?? 1
      u.volume = 0.85
      window.speechSynthesis.speak(u)
    } catch {
      /* speech is a bonus; never block the game on it */
    }
  }

  cancelSpeech() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }

  dispose() {
    this.stopHeart()
    this.cancelSpeech()
    if (this.ctx) {
      try {
        this.ctx.close()
      } catch {
        /* noop */
      }
      this.ctx = null
      this.ready = false
    }
  }
}
