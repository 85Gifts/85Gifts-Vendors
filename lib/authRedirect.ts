let hasRedirectedToLogin = false

export const redirectToLogin = () => {
  if (typeof window === "undefined") return
  
  // Don't redirect if already on login page or other auth pages
  const currentPath = window.location.pathname
  if (currentPath === "/login" || currentPath === "/register" || currentPath.startsWith("/reset-password") || currentPath.startsWith("/verify-email")) {
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
