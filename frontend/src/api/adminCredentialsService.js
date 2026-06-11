import { axiosClient } from './axiosClient'

export const deactivateCredential = async (credentialUuid) => {
  const response = await axiosClient.delete(
    `/credentials/deactivate/${credentialUuid}`,
  )

  return response.data
}

export const activateCredential = async (credentialUuid) => {
  const response = await axiosClient.put(
    `/credentials/activate/${credentialUuid}`,
  )

  return response.data
}

export const changeCredentialRole = async (credentialUuid, role) => {
  const response = await axiosClient.put(
    `/credentials/change-role/${credentialUuid}`,
    {
      role,
    },
  )

  return response.data
}