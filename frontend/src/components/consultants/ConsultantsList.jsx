import { useState, useEffect } from "react";
import UserConsultantsBLL from "../../bll/UserConsultantsBLL.js";
import ConsultantCard from "./ConsultantCard.jsx";
import Select from "../ui/Select.jsx";
import Spinner from "../ui/Spinner.jsx";

export default function ConsultantsList() {
  const [consultants,     setConsultants]     = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filter,          setFilter]          = useState("all");
  const [loading,         setLoading]         = useState(true);
  const [filterLoading,   setFilterLoading]   = useState(false);

  // Load specializations + all consultants on mount
  useEffect(() => {
    const loadAll = async () => {
      const [specResult, conResult] = await Promise.all([
        UserConsultantsBLL.getSpecializations(),
        UserConsultantsBLL.getAll(null),
      ]);
      if (specResult.success) setSpecializations(specResult.specializations);
      if (conResult.success)  setConsultants(conResult.consultants);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleFilterChange = async (value) => {
    setFilter(value);
    setFilterLoading(true);
    const result = await UserConsultantsBLL.getAll(value === "all" ? null : value);
    if (result.success) setConsultants(result.consultants);
    setFilterLoading(false);
  };

  const specOptions = [
    { value: "all", label: "All Specializations" },
    ...specializations.map((s) => ({ value: s, label: s })),
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3">
        <div className="w-56">
          <Select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            options={specOptions}
          />
        </div>
        {filterLoading && <Spinner size="sm" />}
      </div>

      {/* ── Consultant grid ── */}
      {consultants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-12 h-12 text-skin-text-muted mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <p className="text-skin-text font-medium">No consultants found</p>
          <p className="text-skin-text-secondary text-sm mt-1">
            Try selecting a different specialization.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {consultants.map((c) => (
            <ConsultantCard key={c.consultant_id} consultant={c} />
          ))}
        </div>
      )}
    </div>
  );
}