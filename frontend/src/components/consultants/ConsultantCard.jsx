import Badge from "../ui/Badge.jsx";

// ── Star rating: full / half / empty up to 5 ──
function StarRating({ rating }) {
  const r       = parseFloat(rating) || 0;
  const full    = Math.floor(r);
  const hasHalf = (r % 1) >= 0.3;
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
        {r > 0 ? r.toFixed(1) : "—"}
      </span>
    </div>
  );
}

// ── Availability dot ──
const AVAILABILITY_DOT = {
  available:   "bg-emerald-400",
  busy:        "bg-yellow-400",
  unavailable: "bg-gray-400",
};

export default function ConsultantCard({ consultant, onSelect }) {
  const {
    first_name, last_name, specialization, rating,
    is_verified, availability_status,
  } = consultant;

  const initials = `${first_name[0]}${last_name[0]}`.toUpperCase();
  const dotColor = AVAILABILITY_DOT[availability_status] ?? "bg-gray-400";

  return (
    <div
      onClick={() => onSelect?.(consultant)}
      className="bg-skin-card border border-skin-border rounded-2xl p-5 flex flex-col gap-4 animate-slide-up cursor-pointer hover:border-brand hover:shadow-md transition-all duration-200"
    >

      {/* ── Header: avatar + name + badges ── */}
      <div className="flex items-start gap-4">
        {/*
          Avatar: subtle brand background with brand-colored initials.
          Never use bg-brand here — text-brand on bg-brand is invisible.
        */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-skin-brand-subtle flex items-center justify-center">
            <span className="text-sm font-bold text-brand">{initials}</span>
          </div>
          {/* Availability dot — anchored to bottom-right of avatar */}
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-skin-card ${dotColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-skin-text truncate">
            {first_name} {last_name}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="info" size="sm">{specialization}</Badge>
            {is_verified == 1 && (
              <Badge variant="success" size="sm">
                <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ── Rating ── */}
      <StarRating rating={parseFloat(rating)} />

      {/* ── View profile affordance ── */}
      <div className="flex items-center justify-between pt-3 border-t border-skin-border">
        <span className="text-sm text-skin-text-secondary">View full profile</span>
        <svg className="w-4 h-4 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
