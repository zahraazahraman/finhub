import Badge from "../ui/Badge.jsx";

// ── Star rating: full / half / empty up to 5 ──
// Stars use yellow — this is universally understood and not theme-dependent.
function StarRating({ rating }) {
  const full    = Math.floor(rating);
  const hasHalf = (rating % 1) >= 0.3;
  const empty   = 5 - full - (hasHalf ? 1 : 0);

  const FullStar = ({ i }) => (
    <svg key={`f-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const HalfStar = () => (
    <svg className="w-4 h-4" viewBox="0 0 20 20">
      <defs>
        <linearGradient id="half-grad">
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        fill="url(#half-grad)"
        stroke="#facc15"
        strokeWidth="0.5"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  );

  const EmptyStar = ({ i }) => (
    <svg key={`e-${i}`} className="w-4 h-4 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i)  => <FullStar  key={`f-${i}`} />)}
      {hasHalf                        && <HalfStar />}
      {[...Array(empty)].map((_, i) => <EmptyStar key={`e-${i}`} />)}
      <span className="ml-1.5 text-sm font-medium text-skin-text-secondary">
        {parseFloat(rating).toFixed(1)}
      </span>
    </div>
  );
}

export default function ConsultantCard({ consultant }) {
  const { first_name, last_name, email, phone, specialization, rating } = consultant;
  const initials = `${first_name[0]}${last_name[0]}`.toUpperCase();

  return (
    <div className="bg-skin-card border border-skin-border rounded-2xl p-5 flex flex-col gap-4 animate-slide-up">

      {/* ── Header: avatar + name + specialization ── */}
      <div className="flex items-start gap-4">
        {/*
          Avatar: subtle brand background (bg-skin-brand-subtle) with brand-colored initials.
          Do NOT use bg-brand here — solid brand bg makes text-brand initials invisible.
        */}
        <div className="w-12 h-12 rounded-full bg-skin-brand-subtle flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-brand">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-skin-text truncate">
            {first_name} {last_name}
          </p>
          <div className="mt-1.5">
            <Badge variant="info" size="sm">{specialization}</Badge>
          </div>
        </div>
      </div>

      {/* ── Rating ── */}
      <StarRating rating={parseFloat(rating)} />

      {/* ── Contact ── */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-skin-border">
        <a
          href={`mailto:${email}`}
          className="flex items-center gap-2 text-sm text-skin-text-secondary hover:text-skin-text transition-colors min-w-0"
        >
          <svg className="w-4 h-4 flex-shrink-0 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          <span className="truncate">{email}</span>
        </a>
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 text-sm text-skin-text-secondary hover:text-skin-text transition-colors"
        >
          <svg className="w-4 h-4 flex-shrink-0 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
          <span>{phone}</span>
        </a>
      </div>
    </div>
  );
}