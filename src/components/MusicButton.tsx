type Props = {
  playing: boolean
  onToggle: () => void
}

export function MusicButton({ playing, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-label={playing ? 'Pause music' : 'Play music'}
      onClick={onToggle}
      className="fixed bottom-5 right-5 z-40 h-12 w-12 cursor-pointer rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-90 focus:outline-none"
    >
      <div
        className="absolute inset-0 rounded-full animate-spin-cd"
        style={{
          background:
            'linear-gradient(to right bottom, rgba(0, 34, 76, 0.8), rgb(0, 34, 76), rgba(0, 34, 76, 0.867))',
        }}
      >
        <div className="absolute inset-1 rounded-full border border-white/20" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {playing ? (
          <div className="flex h-4 items-end gap-0.5">
            <div className="w-1 rounded-full bg-white animate-dance-1" style={{ height: '60%' }} />
            <div className="w-1 rounded-full bg-white animate-dance-2" style={{ height: '100%' }} />
            <div className="w-1 rounded-full bg-white animate-dance-3" style={{ height: '40%' }} />
            <div className="w-1 rounded-full bg-white animate-dance-4" style={{ height: '80%' }} />
          </div>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>
    </button>
  )
}
