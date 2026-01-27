import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Redirect = () => {
  const { url } = useParams();
  const redirectUrl = decodeURIComponent(url);
  useEffect(() => {
    window.location.href = `${import.meta.env.VITE_API_URL}/${redirectUrl}`;
  }, [redirectUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <h2 className="text-xl font-semibold text-slate-800">Redirecting...</h2>
      <p className="text-slate-500 mt-2">Please wait while we take you to your destination.</p>
    </div>
  );
};

export default Redirect;