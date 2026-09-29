export default function InvalidInvite({ reason = 'invalid' }: { reason?: 'invalid' | 'used' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Invalid invitation link</h1>
        <div className="mx-auto mt-4 h-px w-16 bg-neutral-300" />
        <p className="mt-6 font-serif text-lg leading-relaxed text-neutral-600">
          {reason === 'used'
            ? 'This invitation link has already been opened on another device. Invitations are personal and cannot be shared — please contact Helen and Ian if you need a new link.'
            : 'This invitation link is not valid. This is an invite-only wedding — please use the personal link that was sent to you.'}
        </p>
      </div>
    </div>
  )
}
