import { axiosClient } from './axiosClient'

export const login = async ({ phone, password }) => {
  const response = await axiosClient.post('/auth/login', {
    phone,
    password,
  })

  return response.data
}

export const signUp = async ({
  fullName,
  phone,
  village,
  birthDate,
  photoUrl,
  password,
  confirmPassword,
}) => {
  const response = await axiosClient.post('/auth/sign-up', {
    createCredentialDto: {
      phone,
      password,
      confirmPassword,
    },
    createUserDto: {
      fullName,
      phone,
      village,
      birthDate,
      photoUrl: photoUrl || null,
    },
  })

  return response.data
}
export const forgotPassword = async ({ phone }) => {
  const response = await axiosClient.post('/credentials/forgot-password', {
    phone,
  })

  return response.data
}

export const verifyResetCode = async ({ phone, code }) => {
  const response = await axiosClient.post('/credentials/verify-reset-code', {
    phone,
    code,
  })

  return response.data
}

export const resetPassword = async ({
  phone,
  code,
  newPassword,
  confirmNewPassword,
}) => {
  const response = await axiosClient.patch('/credentials/reset-password', {
    phone,
    code,
    newPassword,
    confirmNewPassword,
  })

  return response.data
}
export const changePassword = async ({
  credentialUuid,
  currentPassword,
  newPassword,
  confirmNewPassword,
}) => {
  const response = await axiosClient.patch(
    `/credentials/change-password/${credentialUuid}`,
    {
      currentPassword,
      newPassword,
      confirmNewPassword,
    },
  )

  return response.data
}