// All sound is synthesised at runtime — no audio files.
// Wind + electrical hum are always present; the drone, static bed and heartbeat
// scale with the interference meter. Callers are spoken with the browser's
// speech engine, pitched per character, over a radio static bed.

import { VoicePlayer } from './voice.js'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export class AudioEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.voiceBus = null
    this.muted = false
    this.ready = false
    this.browserVoice = null
    this.heartTimer = null
    this.heartOn = false

    this.voiceStatus = 'idle'
    this.voiceProgress = 0
    this.onVoiceStatus = null
    this.driveNodes = null

    // Free local neural voices (Kokoro). Starts downloading as soon as the
    // title screen mounts; the browser voice covers the gap and any failure.
    this.speaker = new VoicePlayer({
      getContext: () => this.ctx,
      getDestination: () => this.voiceBus || this.master,
      onStatus: ({ status, progress }) => {
        this.voiceStatus = status
        this.voiceProgress = progress
        this.onVoiceStatus?.({ status, progress })
      },
      onSpeaking: (active) => this.onVoiceActivity?.(active),
      onFallback: (text, voice) => this.speakBrowser(text, voice),
    })
    this.onVoiceActivity = null
  }

  initVoices() {
    this.speaker.init()
  }

  prepareLines(texts, voice) {
    this.speaker.prepare(texts, voice)
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

    this.voiceBus = ctx.createGain()
    this.voiceBus.gain.value = 1
    this.voiceBus.connect(this.master)

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

    // Browsers may suspend the context until a gesture lands; keep it awake.
    this.resume = () => {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume()
    }
    document.addEventListener('pointerdown', this.resume, true)
    document.addEventListener('keydown', this.resume, true)
    this.resume()
  }

  pickVoice() {
    if (!window.speechSynthesis) return
    const choose = () => {
      const voices = window.speechSynthesis.getVoices() || []
      const en = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
      this.browserVoice =
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

  // Engine rumble and tyre hiss while the car is rolling. Two square waves
  // under a low-pass keep it in the Game Boy's register.
  setDriving(on) {
    if (!this.ctx) return
    if (on) {
      if (!this.driveNodes) {
        const ctx = this.ctx
        const gain = ctx.createGain()
        gain.gain.value = 0
        gain.connect(this.master)

        const osc = ctx.createOscillator()
        osc.type = 'square'
        osc.frequency.value = 46
        const osc2 = ctx.createOscillator()
        osc2.type = 'square'
        osc2.frequency.value = 92.5
        const filt = ctx.createBiquadFilter()
        filt.type = 'lowpass'
        filt.frequency.value = 230
        const sub = ctx.createGain()
        sub.gain.value = 0.32
        osc.connect(filt)
        osc2.connect(sub).connect(filt)
        filt.connect(gain)

        const road = ctx.createBufferSource()
        road.buffer = this.noiseBuffer
        road.loop = true
        const rf = ctx.createBiquadFilter()
        rf.type = 'lowpass'
        rf.frequency.value = 520
        const rg = ctx.createGain()
        rg.gain.value = 0
        road.connect(rf).connect(rg).connect(this.master)

        osc.start()
        osc2.start()
        road.start()
        this.driveNodes = { gain, osc, osc2, rg }
      }
      const t = this.ctx.currentTime
      this.driveNodes.gain.gain.setTargetAtTime(0.05, t, 0.6)
      this.driveNodes.rg.gain.setTargetAtTime(0.03, t, 0.8)
      this.driveNodes.osc.frequency.setTargetAtTime(46, t, 0.5)
      this.driveNodes.osc2.frequency.setTargetAtTime(92.5, t, 0.5)
    } else if (this.driveNodes) {
      const t = this.ctx.currentTime
      this.driveNodes.gain.gain.setTargetAtTime(0, t, 0.25)
      this.driveNodes.rg.gain.setTargetAtTime(0, t, 0.3)
    }
  }

  // Short square-wave UI tone.
  beep(freq = 880, dur = 0.06, level = 0.05, type = 'square') {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(level, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + dur + 0.02)
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

  blip(freq, dur, level, at, type = 'sine') {
    if (!this.ctx) return
    const t = at ?? this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
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
      ;[440, 480].forEach((f) => this.blip(f, 1.9, 0.045, start, 'square'))
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
    this.blip(660, 0.09, 0.05, t, 'square')
    this.blip(880, 0.14, 0.05, t + 0.1, 'square')
    this.blip(1174, 0.2, 0.04, t + 0.24, 'square')
  }

  wrong() {
    if (!this.ctx) return
    this.burst(0.7, 0.28)
    const t = this.ctx.currentTime
    this.blip(110, 0.4, 0.1, t, 'square')
    this.blip(82, 0.55, 0.09, t + 0.14, 'square')
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
    if (this.muted) return
    // Neural voice first; the browser voice only covers model loading/failure.
    if (this.voiceStatus === 'ready' && voice.piper) {
      if (this.speaker.speak(text, voice)) return
    }
    this.speakBrowser(text, voice)
  }

  speakBrowser(text, voice = {}) {
    if (!window.speechSynthesis) return
    const clean = text.replace(/\[[^\]]*\]/g, '').trim()
    if (!clean) return
    try {
      const u = new SpeechSynthesisUtterance(clean)
      if (this.browserVoice) u.voice = this.browserVoice
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
    this.speaker.cancel()
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }

  dispose() {
    this.stopHeart()
    this.cancelSpeech()
    this.speaker.dispose()
    this.driveNodes = null
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
