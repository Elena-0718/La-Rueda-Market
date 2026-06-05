const TOKEN_KEY = 'la_rueda_token'
const USER_KEY = 'la_rueda_user'
const AUTH_CHANGE_EVENT = 'la_rueda_auth_change'

export const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  notifyAuthChange()
}

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

export const getAuthUser = () => {
  const user = localStorage.getItem(USER_KEY)

  if (!user) {
    return null
  }

  return JSON.parse(user)
}

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  notifyAuthChange()
}

export const isAuthenticated = () => {
  return Boolean(getAuthToken())
}

export const AUTH_CHANGE_EVENT_NAME = AUTH_CHANGE_EVENT