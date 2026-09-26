import { useState } from 'react'
import './EnvelopeHero.css'

const Stem = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 40 120" fill="none" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round">
    <path d="M20 118 C21 90 17 60 22 30" />
    <path d="M22 30 C24 22 30 16 33 12" />
    <path d="M20 46 C15 36 10 30 8 22" />
    <ellipse cx="34" cy="10" rx="4.5" ry="3" transform="rotate(-30 34 10)" />
    <ellipse cx="7" cy="20" rx="4.5" ry="3" transform="rotate(25 7 20)" />
    <path d="M20 70 C14 66 10 60 9 54" />
    <ellipse cx="9" cy="53" rx="3.5" ry="2.5" transform="rotate(20 9 53)" />
  </svg>
)

const Swash = () => (
  <svg className="card__swash" viewBox="0 0 200 40" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round">
    <path d="M4 26 C40 6 70 6 96 22 C120 36 150 36 196 14" />
    <path d="M96 22 C104 12 114 8 124 12 C132 16 128 26 118 26 C108 26 104 18 112 10" strokeWidth="1.6" />
  </svg>
)

function Card() {
  return (
    <div className="card" aria-label="Wedding invitation card">
      <div className="card__inner">
        <Swash />
        <div className="card__title">Wedding invitation</div>
        <div className="card__names">
          <Stem className="card__stem card__stem--left" />
          <div className="card__name">HELEN</div>
          <div className="card__and">and</div>
          <div className="card__name">IAN</div>
          <Stem className="card__stem card__stem--right" />
        </div>
        <div className="card__line card__line--lead">invite you to celebrate their marriage</div>
        <div className="card__line">Saturday, November 28, 2026</div>
        <div className="card__line">at 11.00am</div>
        <div className="card__line">St Peter&apos;s Cathedral, Rugarama</div>
        <div className="card__line card__line--small">Reception : Kabale Golf Course</div>
      </div>
    </div>
  )
}

export default function EnvelopeHero() {
  const [run, setRun] = useState(0)

  return (
    <section className="hero" id="top">
      <div className="hero__scene" key={run}>
        <div className="env-back">
          <div className="env-back__panel" />
          <Card />
          <div className="env-back__pocket" />
          <div className="env-back__flap">
            <div className="env-back__flap-face env-back__flap-face--outer" />
            <div className="env-back__flap-face env-back__flap-face--inner" />
          </div>
        </div>
        <div className="env-front" />
      </div>

      <button type="button" className="hero__replay" aria-label="Replay" onClick={() => setRun((n) => n + 1)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="#1f1f1f">
          <path d="M3 1.5v11l9-5.5z" />
        </svg>
      </button>

      <a className="hero__scroll" href="#details">
        <span>Scroll</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#1f1f1f" strokeWidth="1.4">
          <path d="M2 5l5 5 5-5" />
        </svg>
      </a>
    </section>
  )
}
