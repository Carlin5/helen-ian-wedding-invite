import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import EnvelopeHero from '../components/EnvelopeHero'

const label = 'uppercase tracking-[0.2em] text-[11px] text-neutral-500'
const outlineBtn =
  'inline-block border border-black px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors'

const hotels = [
  {
    name: 'White Horse Inn, Kabale',
    address: 'Plot 25 Rwamafa Road, Makanga Hill, Kabale, UG',
    tel: '+256 779 414342',
    image: '/assets/hotel-white-horse.png',
  },
  {
    name: "Cepha's Inn",
    address: 'Plot 7-9 Archer Road-Makanga Hill, Kabale, Uganda',
    tel: '+256 776 840732',
    image: '/assets/hotel-cephas.png',
  },
  {
    name: 'Kigezi Gardens Inn',
    address: '18 Archer road, Makanga, Kabale',
    tel: '+256 773 250306',
    image: '/assets/hotel-kigezi.png',
  },
]

const team = [
  {
    role: 'Event Coordinator Lead - International Guests',
    name: 'Sarah',
    tel: '+44 7851 026329',
    image: '/assets/team-sarah.png',
  },
  {
    role: 'Assistant Event Coordinator',
    name: 'Alex',
    tel: '+44 7384 718776',
    image: '/assets/team-alex.png',
  },
  {
    role: 'Event Coordinator Kabale in Western Uganda',
    name: 'Racheal',
    tel: '+256 747 084996',
    image: '/assets/team-racheal.png',
  },
  {
    role: 'Event Coordinator',
    name: 'Stacey',
    tel: '+256 753 726100',
    image: '/assets/team-stacey.png',
  },
]

const telHref = (tel: string) => `tel:${tel.replace(/\s+/g, '')}`
const mapsHref = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

function HeartMapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M12 21s-7-4.5-9.5-9C.7 8.5 2.5 4.5 6.5 4.5c2.4 0 4 1.4 5.5 3.2 1.5-1.8 3.1-3.2 5.5-3.2 4 0 5.8 4 4 7.5-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="4" y="3" width="16" height="18" />
      <path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2M10 21v-4h4v4" />
    </svg>
  )
}

function FlowerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 9c0-2 1-4 3-5M12 9c0-2-1-4-3-5M15 12c2 0 4 1 5 3M15 12c2 0 4-1 5-3M12 15c0 2 1 4 3 5M12 15c0 2-1 4-3 5M9 12c-2 0-4 1-5 3M9 12c-2 0-4-1-5-3" />
    </svg>
  )
}

function AccommodationCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const scrollTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const child = track.children[i] as HTMLElement | undefined
    if (child) track.scrollTo({ left: child.offsetLeft - track.offsetLeft, behavior: 'smooth' })
    setIndex(i)
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const el = e.currentTarget
          const child = el.children[0] as HTMLElement | undefined
          if (!child) return
          const w = child.offsetWidth + 24
          setIndex(Math.min(hotels.length - 1, Math.round(el.scrollLeft / w)))
        }}
      >
        {hotels.map((hotel) => (
          <div
            key={hotel.name}
            className="flex w-full shrink-0 snap-center items-center gap-6 border border-black bg-white p-6 sm:w-[520px]"
          >
            <img
              src={hotel.image}
              alt={hotel.name}
              className="h-32 w-32 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">{hotel.address}</p>
              <a
                href={mapsHref(hotel.name + ' Kabale')}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-serif text-xl underline underline-offset-4"
              >
                {hotel.name}
              </a>
              <a href={telHref(hotel.tel)} className="mt-1 block text-sm underline underline-offset-4">
                {hotel.tel}
              </a>
              <a
                href={mapsHref(hotel.name + ' Kabale')}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block border border-black px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
              >
                Book now
              </a>
            </div>
          </div>
        ))}
      </div>
      <button
        aria-label="Previous"
        onClick={() => scrollTo(Math.max(0, index - 1))}
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white sm:flex"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={() => scrollTo(Math.min(hotels.length - 1, index + 1))}
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black bg-white sm:flex"
      >
        ›
      </button>
      <div className="mt-4 flex justify-center gap-2">
        {hotels.map((hotel, i) => (
          <button
            key={hotel.name}
            aria-label={`Go to ${hotel.name}`}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full border border-black ${i === index ? 'bg-black' : 'bg-transparent'}`}
          />
        ))}
      </div>
    </div>
  )
}

function FloatingRsvpBar() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
        >
          <div className="flex gap-2 rounded-full bg-neutral-400/90 p-2 shadow-lg backdrop-blur">
            <Link
              to="/rsvp?attending=yes"
              className="rounded-full bg-white px-5 py-2 text-[11px] uppercase tracking-[0.15em] hover:bg-neutral-100"
            >
              Will attend
            </Link>
            <Link
              to="/rsvp?attending=no"
              className="rounded-full bg-white px-5 py-2 text-[11px] uppercase tracking-[0.15em] hover:bg-neutral-100"
            >
              Will not attend
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Invite() {
  const navigate = useNavigate()
  return (
    <div className="bg-cream text-ink">
      <EnvelopeHero />

      {/* Details */}
      <section id="details" className="bg-white px-6 py-20 text-center">
        <h1 className="font-serif text-4xl sm:text-[40px]">Helen and Ian&apos;s Wedding Invitation</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className={outlineBtn} onClick={() => navigate('/rsvp?attending=yes')}>
            Will attend
          </button>
          <button className={outlineBtn} onClick={() => navigate('/rsvp?attending=no')}>
            Will not attend
          </button>
        </div>
        <p className="mt-6 font-serif text-sm italic text-neutral-600">
          Invite only wedding — please RSVP with the name on your invitation
        </p>
        <div className="mx-auto mt-12 grid max-w-2xl gap-10 border-t border-neutral-200 pt-10 sm:grid-cols-2">
          <div>
            <p className={label}>Date</p>
            <p className="mt-3 font-serif text-lg">Saturday, November 28, 2026</p>
            <p className="font-serif text-lg">11:00AM EAT</p>
          </div>
          <div>
            <p className={label}>Address</p>
            <p className="mt-3 font-serif text-lg">
              <a
                href={mapsHref("St Peter's Cathedral Rugarama Kabale")}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                St Peter&apos;s Cathedral, Rugarama, Kabale
              </a>
            </p>
            <p className="font-serif text-lg">
              Reception:{' '}
              <a
                href={mapsHref('Kabale Golf Course')}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Kabale Golf Course
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Our love story */}
      <section className="px-6 py-20 text-center">
        <HeartMapIcon />
        <h2 className={`${label} mt-4 !text-neutral-700`}>Our love story</h2>
        <img
          src="/assets/love-story.png"
          alt="Helen and Ian"
          className="mx-auto mt-8 w-full max-w-3xl rounded-none"
        />
        <div className="mx-auto mt-0 max-w-3xl bg-[#f3eee4] px-8 py-10">
          <p className="text-left font-serif text-lg leading-relaxed text-neutral-700">
            Helen and Ian met back in July the 25th, 2024 Met at a conference held @ Hilton London
            Syon Park ,London. Ian was struck by Helen&apos;s beauty &amp; kindness, and sense of
            humour. Somewhere between laughter and late-night talks, Ian realized he wasn&apos;t
            just falling in love with her but was falling into a life he never knew he was missing.
            They couldn&apos;t keep away from each other in the following weeks. Before they knew
            it, weeks rolled into months, then months rolled to date ...
          </p>
        </div>
      </section>

      {/* Accommodation */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <BuildingIcon />
          <h2 className={`${label} mt-4 !text-neutral-700`}>Recommended accommodation</h2>
          <div className="mt-10 text-left">
            <AccommodationCarousel />
          </div>
        </div>
      </section>

      {/* Support team */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <FlowerIcon />
          <h2 className={`${label} mt-4 !text-neutral-700`}>Wedding event support team</h2>
          <p className="mt-3 font-serif text-lg italic text-neutral-600">
            Get to know the Wedding Support Team
          </p>
          <div className="mt-10">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center gap-6 border-t border-neutral-200 py-8 text-left sm:flex-row last:border-b"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-40 w-40 shrink-0 rounded-full object-cover sm:w-56 sm:h-56"
                />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                    {member.role}
                  </p>
                  <p className="mt-2 font-serif text-2xl">{member.name}</p>
                  <a href={telHref(member.tel)} className="mt-1 inline-block text-sm underline underline-offset-4">
                    {member.tel}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">
          Helen &amp; Ian · 28 November 2026 · Kabale, Uganda
        </p>
        <Link to="/admin" className="mt-3 inline-block text-[10px] text-neutral-400 underline">
          Admin
        </Link>
      </footer>

      <FloatingRsvpBar />
    </div>
  )
}
