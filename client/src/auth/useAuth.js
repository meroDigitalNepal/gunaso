import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { apiRequest } from './msalConfig';

export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const user = accounts[0] ?? null;

  function login() {
    return instance.loginPopup({
      ...apiRequest,
      redirectUri: window.location.origin + import.meta.env.BASE_URL + 'redirect.html',
    });
  }

  function logout() {
    return instance.logoutPopup({ account: user });
  }

  return { isAuthenticated, user, login, logout };
}
