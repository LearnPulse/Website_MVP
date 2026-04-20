export function useAuth() {
  return {
    isAuthenticated: true,
    isLoading: false,
  };
}

export function getStoredToken() {
  return "demo-token";
}
