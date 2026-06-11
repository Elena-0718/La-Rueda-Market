import { axiosClient } from './axiosClient'

export const getMyProfile = async () => {
  const response = await axiosClient.get('/users/my-profile')
  return response.data
}

export const updateMyProfile = async ({
  fullName,
  village,
  birthDate,
  photoUrl,
}) => {
  const response = await axiosClient.put('/users/update-my-profile', {
    fullName,
    village,
    birthDate,
    photoUrl: photoUrl || null,
  })

  return response.data
}

export const uploadUserImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post('/uploads/users', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}