import { useCallback, useEffect, useState } from "react";

function getCurrentPath() {
  return window.location.pathname || "/";
}

export function useRouter() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => setPath(getCurrentPath());

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((nextPath: string) => {
    window.history.pushState(null, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { path, navigate };
}
