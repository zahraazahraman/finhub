import { useState } from "react";
import AIChatPanel from "../components/consultants/AIChatPanel.jsx";
import ConsultantsList from "../components/consultants/ConsultantsList.jsx";
import ConsultantProfileDrawer from "../components/consultants/ConsultantProfileDrawer.jsx";
import InquiryModal from "../components/consultants/InquiryModal.jsx";
import MyInquiries from "../components/consultants/MyInquiries.jsx";

const TABS = [
  {
    id:    "ai",
    label: "AI Consultant",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
  },
  {
    id:    "human",
    label: "Find a Consultant",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
  },
  {
    id:    "inquiries",
    label: "My Inquiries",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function UserConsultants() {
  const [activeTab,     setActiveTab]     = useState("ai");
  const [activeProfile, setActiveProfile] = useState(null);
  const [needsState,    setNeedsState]    = useState({ done: false, situation: "", matchedIds: [] });
  const [inquiryTarget, setInquiryTarget] = useState(null);

  return (
    <div className="animate-fade-in flex flex-col gap-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-skin-text">Consultants</h1>
        <p className="text-skin-text-secondary text-sm mt-1">
          Get personalized AI financial advice or connect with a human expert.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 p-1 bg-skin-card border border-skin-border rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id
                ? "bg-brand text-white shadow-sm"
                : "text-skin-text-secondary hover:text-skin-text hover:bg-skin-hover"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === "ai"        && <AIChatPanel />}
      {activeTab === "inquiries" && <MyInquiries />}
      {activeTab === "human" && (
        <ConsultantsList
          onSelect={(consultant) => setActiveProfile(consultant)}
          needsState={needsState}
          onNeedsMatch={(situation, matchedIds) =>
            setNeedsState({ done: true, situation, matchedIds })
          }
          onNeedsReset={() =>
            setNeedsState({ done: false, situation: "", matchedIds: [] })
          }
        />
      )}

      {/* ── Profile drawer — rendered outside tab flow so it overlays everything ── */}
      {activeProfile && (
        <ConsultantProfileDrawer
          profile={activeProfile}
          onClose={() => setActiveProfile(null)}
          onProfileLoad={(full) => setActiveProfile(full)}
          onConnect={() => setInquiryTarget(activeProfile)}
        />
      )}

      {/* ── Inquiry modal — z-50, overlays the drawer (z-[46]) ── */}
      {inquiryTarget && (
        <InquiryModal
          consultant={inquiryTarget}
          situationTag={needsState.situation}
          onClose={() => setInquiryTarget(null)}
          onSuccess={() => {
            setInquiryTarget(null);
            setActiveProfile(null);
          }}
        />
      )}
    </div>
  );
}
