import { useEffect, useState } from "react";
import UserConsultantsBLL from "../../bll/UserConsultantsBLL.js";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";

// ── Star rating row (compact, read-only) ──
function StarRow({ value, max = 5 }) {
  const v       = parseFloat(value) || 0;
  const full    = Math.floor(v);
  const hasHalf = (v % 1) >= 0.3;
  const empty   = max - full - (hasHalf ? 1 : 0);
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => (
        <svg key={`f-${i}`} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalf && (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20">
          <defs><linearGradient id="half-g2"><stop offset="50%" stopColor="#facc15" /><stop offset="50%" stopColor="transparent" /></linearGradient></defs>
          <path fill="url(#half-g2)" stroke="#facc15" strokeWidth="0.5" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {[...Array(empty)].map((_, i) => (
        <svg key={`e-${i}`} className="w-3.5 h-3.5 text-skin-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 20 20">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-medium text-skin-text-secondary">{v > 0 ? v.toFixed(1) : "—"}</span>
    </span>
  );
}

// ── Section heading ──
function SectionTitle({ children }) {
  return (
    <p className="text-xs font-semibold text-skin-text-muted uppercase tracking-wider mb-2">
      {children}
    </p>
  );
}

// ── Rich-data skeleton (shown while getOne is loading) ──
function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Bio skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-16 bg-skin-hover rounded" />
        <div className="h-3.5 bg-skin-hover rounded w-full" />
        <div className="h-3.5 bg-skin-hover rounded w-5/6" />
        <div className="h-3.5 bg-skin-hover rounded w-4/6" />
      </div>
      {/* Sub-skills skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 bg-skin-hover rounded" />
        <div className="flex flex-wrap gap-2">
          {[80, 100, 70, 90].map((w) => (
            <div key={w} className={`h-6 bg-skin-hover rounded-full`} style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* Case studies skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 bg-skin-hover rounded" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-skin-hover rounded-xl p-4 flex flex-col gap-2">
            <div className="h-3.5 bg-skin-secondary rounded w-3/4" />
            <div className="h-3 bg-skin-secondary rounded w-full" />
            <div className="h-3 bg-skin-secondary rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

const AVAILABILITY_DOT = {
  available:   "bg-emerald-400",
  busy:        "bg-yellow-400",
  unavailable: "bg-gray-400",
};

const AVAILABILITY_LABEL = {
  available:   "Available",
  busy:        "Busy",
  unavailable: "Unavailable",
};

// ── Main drawer ──
export default function ConsultantProfileDrawer({ profile, onClose, onProfileLoad, onConnect }) {
  const [loadingRich, setLoadingRich] = useState(false);

  // Fetch full profile once when drawer opens with a consultant that hasn't
  // been loaded yet (bio === undefined means basic card data only).
  useEffect(() => {
    if (!profile || profile.bio !== undefined) return;

    let cancelled = false;
    setLoadingRich(true);

    UserConsultantsBLL.getOne(profile.consultant_id).then((result) => {
      if (cancelled) return;
      if (result.success) onProfileLoad(result.consultant);
      setLoadingRich(false);
    });

    return () => { cancelled = true; };
  }, [profile?.consultant_id]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!profile) return null;

  const {
    first_name, last_name, specialization, rating,
    is_verified, availability_status,
    bio, sub_skills, languages, years_experience, fee_structure, case_studies,
  } = profile;

  const initials   = `${first_name[0]}${last_name[0]}`.toUpperCase();
  const dotColor   = AVAILABILITY_DOT[availability_status ?? "available"] ?? "bg-gray-400";
  const dotLabel   = AVAILABILITY_LABEL[availability_status ?? "available"] ?? "Unknown";
  const richLoaded = bio !== undefined && !loadingRich;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-black/40 z-[45] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-skin-base border-l border-skin-border shadow-2xl z-[46] flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 pt-6 pb-5 border-b border-skin-border">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-skin-text-muted hover:text-skin-text hover:bg-skin-hover transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4 pr-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-skin-brand-subtle flex items-center justify-center">
                <span className="text-lg font-bold text-brand">{initials}</span>
              </div>
              <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-skin-base ${dotColor}`} />
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-skin-text leading-tight">
                {first_name} {last_name}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
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
              <div className="flex items-center gap-3 mt-2.5">
                <StarRow value={rating} />
                <span className="flex items-center gap-1 text-xs text-skin-text-muted">
                  <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
                  {dotLabel}
                </span>
              </div>
              {years_experience != null && (
                <p className="text-xs text-skin-text-muted mt-1">
                  {years_experience} {years_experience === 1 ? "year" : "years"} experience
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loadingRich ? (
            <ProfileSkeleton />
          ) : !richLoaded ? (
            <ProfileSkeleton />
          ) : (
            <div className="flex flex-col gap-6">

              {/* About / Bio */}
              {bio && (
                <div>
                  <SectionTitle>About</SectionTitle>
                  <p className="text-sm text-skin-text leading-relaxed">{bio}</p>
                </div>
              )}

              {/* Sub-skills */}
              {Array.isArray(sub_skills) && sub_skills.length > 0 && (
                <div>
                  <SectionTitle>Specializations</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {sub_skills.map((skill) => (
                      <Badge key={skill} variant="default" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {Array.isArray(languages) && languages.length > 0 && (
                <div>
                  <SectionTitle>Languages</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 text-xs font-medium text-skin-text-secondary bg-skin-hover border border-skin-border rounded-full px-3 py-1"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fee structure */}
              {fee_structure && (
                <div>
                  <SectionTitle>Consultation Fee</SectionTitle>
                  <div className="flex items-center gap-2">
                    {fee_structure.free_intro && (
                      <Badge variant="success" size="sm">
                        <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Free intro session
                      </Badge>
                    )}
                    {fee_structure.session_fee && (
                      <span className="text-sm text-skin-text">${fee_structure.session_fee} / session</span>
                    )}
                    {!fee_structure.free_intro && !fee_structure.session_fee && (
                      <span className="text-sm text-skin-text-muted">Contact for pricing</span>
                    )}
                  </div>
                </div>
              )}

              {/* Case studies */}
              {Array.isArray(case_studies) && case_studies.length > 0 && (
                <div>
                  <SectionTitle>Case Studies</SectionTitle>
                  <div className="flex flex-col gap-3">
                    {case_studies.map((cs, i) => (
                      <div
                        key={i}
                        className="bg-skin-secondary border border-skin-border rounded-xl p-4"
                      >
                        <p className="text-sm font-semibold text-skin-text mb-1">{cs.title}</p>
                        <p className="text-xs text-skin-text-secondary leading-relaxed">{cs.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state — no rich data */}
              {!bio && (!sub_skills || sub_skills.length === 0) && (!case_studies || case_studies.length === 0) && (
                <p className="text-sm text-skin-text-muted text-center py-6">
                  Profile details coming soon.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer — Connect button ── */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-skin-border bg-skin-card">
          <Button
            variant="primary"
            className="w-full justify-center"
            onClick={onConnect}
          >
            Connect with {first_name}
          </Button>
        </div>
      </div>
    </>
  );
}
