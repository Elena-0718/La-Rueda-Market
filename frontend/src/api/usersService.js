import { axiosClient } from './axiosClient'

export const getMyProfile = async () => {
  const response = await axiosClient.get('/users/my-profile')
  return response.data
}

export const updateMyProfile = async ({
  fullName,
  phone,
  village,
  birthDate,
  photoUrl,
}) => {
  const response = await axiosClient.put('/users/update-my-profile', {
    fullName,
    phone,
    village,
    birthDate,
    photoUrl: photoUrl || null,
  })

  return response.data
}