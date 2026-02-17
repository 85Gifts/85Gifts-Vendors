let hasRedirectedToLogin = false

export const redirectToLogin = () => {
  if (typeof window === "undefined") return
  
  const currentPath = window.location.pathname
  
  // Don't redirect if already on login page or other auth pages
  if (currentPath === "/login" || 
      currentPath === "/register" || 
      currentPath.startsWith("/reset-password") || 
      currentPath.startsWith("/verify-email") ||
      currentPath === "/verifyEmail") {
    return
  }
  
  // Don't redirect from public routes
  if (currentPath?.startsWith("/event/") || 
      currentPath === "/" ||
      currentPath?.startsWith("/booking-success") ||
      currentPath?.startsWith("/inventory/")) {
    return
  }
  
  // Prevent multiple redirects
  if (hasRedirectedToLogin) return
  
  hasRedirectedToLogin = true
  window.location.href = "/login"
  
  // Reset flag after a delay to allow navigation
  setTimeout(() => {
    hasRedirectedToLogin = false
  }, 1000)
}
