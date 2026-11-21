// Free, on-device neural voices (Piper / VITS). Models are fetched once from
// Hugging Face and cached in the browser's origin-private file system, so the
// game needs no API key and no server.
import * as tts from '@diffusionstudio/vits-web'

const clean = (text) => text.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
const keyFor = (text, voice) => `${voice.piper}|${voice.rate ?? 1}|${clean(text)}`

// Two narrator voices cover the whole cast; each caller gets a different rate.
const PRELOAD = ['en_US-amy-medium', 'en_US-ryan-medium']

export class VoicePlayer {
  constructor({ getContext, getDestination, onStatus, onSpeaking, onFallback }) {
    this.getContext = getContext
    this.getDestination = getDestination
    this.onStatus = onStatus
    this.onSpeaking = onSpeaking
    this.onFallback = onFallback

    this.status = 'idle' // idle | loading | ready | error
    this.progress = 0

    this.started = false
    this.queue = []
    this.queued = new Set()
    this.cache = new Map()
    this.busy = false
    this.wanted = null
    this.current = null
    this.lastPrepare = null
  }

  emit() {
    this.onStatus?.({ status: this.status, progress: this.progress })
  }

  init() {
    if (this.started) return
    this.started = true
    this.preload()
  }

  async preload() {
    this.status = 'loading'
    this.emit()
    try {
      for (let i = 0; i < PRELOAD.length; i += 1) {
        const voiceId = PRELOAD[i]
        await tts.download(voiceId, (event) => {
          if (!event || !event.total) return
          const slice = (event.loaded / event.total) * 100
          const next = Math.round((i * 100 + slice) / PRELOAD.length)
          if (next > this.progress) {
            this.progress = next
            this.emit()
          }
        })
        this.progress = Math.round(((i + 1) * 100) / PRELOAD.length)
        this.emit()
      }
      this.status = 'ready'
      this.progress = 100
      this.emit()
      if (this.lastPrepare) this.prepare(this.lastPrepare.texts, this.lastPrepare.voice)
      this.pump()
    } catch (error) {
      console.warn('[voice] voice models unavailable:', error)
      this.status = 'error'
      this.emit()
    }
  }

  /** Queue a call's lines for generation, in order, ahead of playback. */
  prepare(texts, voice) {
    if (!voice?.piper) return
    this.lastPrepare = { texts, voice }
    if (this.status !== 'ready') return
    for (const text of texts) this.enqueue(text, voice)
  }

  enqueue(text, voice) {
    const spoken = clean(text)
    if (!spoken) return
    const id = keyFor(text, voice)
    if (this.cache.has(id) || this.queued.has(id)) return
    this.queued.add(id)
    this.queue.push({ id, text: spoken, voice })
    this.pump()
  }

  async pump() {
    if (this.busy || this.queue.length === 0) return
    const job = this.queue.shift()
    this.busy = true
    try {
      const blob = await tts.predict({ text: job.text, voiceId: job.voice.piper })
      const wav = await blob.arrayBuffer()
      this.cache.set(job.id, { wav, buffer: null, rate: job.voice.rate ?? 1 })
      if (this.wanted === job.id) this.play(job.id)
    } catch (error) {
      console.warn('[voice] line failed:', error)
      if (this.wanted === job.id) this.onFallback?.(job.text, job.voice)
    } finally {
      this.queued.delete(job.id)
      this.busy = false
      this.pump()
    }
  }

  /** Play a line now if it exists, otherwise generate it. */
  speak(text, voice) {
    if (!voice?.piper) return false
    const id = keyFor(text, voice)
    this.wanted = id
    if (this.cache.has(id)) {
      this.play(id)
      return true
    }
    this.enqueue(text, voice)
    return true
  }

  play(id) {
    const ctx = this.getContext()
    const destination = this.getDestination()
    const item = this.cache.get(id)
    if (!ctx || !destination || !item) return

    const start = (buffer) => {
      this.stop()
      if (ctx.state === 'suspended') ctx.resume()
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.playbackRate.value = item.rate

      const highpass = ctx.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 300
      const lowpass = ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 3400
      const presence = ctx.createBiquadFilter()
      presence.type = 'peaking'
      presence.frequency.value = 1700
      presence.Q.value = 0.8
      presence.gain.value = 4
      const gain = ctx.createGain()
      gain.gain.value = 0

      source.connect(highpass)
      highpass.connect(lowpass)
      lowpass.connect(presence)
      presence.connect(gain)
      gain.connect(destination)

      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.95, now + 0.04)

      source.onended = () => {
        if (this.current && this.current.source === source) this.current = null
        this.onSpeaking?.(false)
      }

      source.start()
      this.current = { source, gain }
      this.onSpeaking?.(true)

      // Some browsers never fire `ended` on a suspended output; don't leave
      // the caller card lit forever.
      const durationMs = (buffer.duration * 1000) / (item.rate || 1) + 150
      setTimeout(() => {
        if (this.current && this.current.source === source) {
          this.current = null
          this.onSpeaking?.(false)
        }
      }, durationMs)
    }

    if (item.buffer) {
      start(item.buffer)
      return
    }
    ctx
      .decodeAudioData(item.wav.slice(0))
      .then((buffer) => {
        item.buffer = buffer
        if (this.wanted === id) start(buffer)
      })
      .catch((error) => {
        console.warn('[voice] decode failed:', error)
        if (this.wanted === id) this.onFallback?.(clean(id), {})
      })
  }

  stop() {
    this.onSpeaking?.(false)
    if (!this.current) return
    const ctx = this.getContext()
    const { source, gain } = this.current
    this.current = null
    if (!ctx) return
    try {
      const now = ctx.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.06)
      source.stop(now + 0.1)
    } catch {
      /* already stopped */
    }
  }

  cancel() {
    this.wanted = null
    this.stop()
  }

  dispose() {
    this.cancel()
    this.queue = []
    this.queued.clear()
    this.cache.clear()
  }
}
