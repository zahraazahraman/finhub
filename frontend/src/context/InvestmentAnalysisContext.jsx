import { createContext, useContext, useState } from "react";

const InvestmentAnalysisContext = createContext(null);

export function InvestmentAnalysisProvider({ children }) {
  // Keyed by investment_id so each investment keeps its own result
  // Shape: { [investment_id]: { loading: bool, error: string|null, data: object|null } }
  const [analyses, setAnalyses] = useState({});

  // Call this before starting a new fetch — clears any previous result for that investment
  const startAnalysis = (investmentId) => {
    setAnalyses((prev) => ({
      ...prev,
      [investmentId]: { loading: true, error: null, data: null },
    }));
  };

  const setAnalysisResult = (investmentId, data) => {
    setAnalyses((prev) => ({
      ...prev,
      [investmentId]: { loading: false, error: null, data },
    }));
  };

  const setAnalysisError = (investmentId, error) => {
    setAnalyses((prev) => ({
      ...prev,
      [investmentId]: { loading: false, error, data: null },
    }));
  };

  // Returns { loading, error, data } or null if never analyzed
  const getAnalysis = (investmentId) => analyses[investmentId] ?? null;

  return (
    <InvestmentAnalysisContext.Provider
      value={{ getAnalysis, startAnalysis, setAnalysisResult, setAnalysisError }}
    >
      {children}
    </InvestmentAnalysisContext.Provider>
  );
}

export function useInvestmentAnalysis() {
  return useContext(InvestmentAnalysisContext);
}