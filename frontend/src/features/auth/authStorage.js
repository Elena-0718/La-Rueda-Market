const TOKEN_KEY = 'la_rueda_token'
const USER_KEY = 'la_rueda_user'

export const saveAuthSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
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
}

export const isAuthenticated = () => {
  return Boolean(getAuthToken())
}