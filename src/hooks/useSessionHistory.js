import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useSessionHistory() {
  const location = useLocation();

  useEffect(() => {
    const prev = sessionStorage.getItem("prevPath");
    const current = location.pathname;

    // shift current → prev, then store new current
    if (current !== prev) {
      sessionStorage.setItem("prevPath", current);
    }
  }, [location]);

  // helper getters
  const getPrevPath = () => sessionStorage.getItem("prevPath");

  return { getPrevPath };
}
