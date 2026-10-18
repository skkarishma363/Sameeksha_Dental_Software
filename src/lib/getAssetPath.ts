export const getAssetPath = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  // 1. Check explicit build-time environment variable
  let basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // 2. In browser runtime, adapt based on active hostname and pathname
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Custom domain (sameekshadental.com) and local development run from root
    if (
      hostname === "sameekshadental.com" ||
      hostname === "www.sameekshadental.com" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1"
    ) {
      basePath = "";
    } else if (pathname.startsWith("/Sameeksha_Dental_Software")) {
      // Direct GitHub Pages repository subpath
      basePath = "/Sameeksha_Dental_Software";
    }
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const encodedPath = cleanPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
    .replace(/%20/g, "%20");

  if (basePath && (cleanPath === basePath || cleanPath.startsWith(`${basePath}/`))) {
    return cleanPath;
  }

  return basePath ? `${basePath}${encodedPath}` : encodedPath;
};
