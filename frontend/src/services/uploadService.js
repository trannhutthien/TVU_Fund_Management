import api from './api'

export const uploadService = {
  // Upload 1 file
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload nhiều files
  uploadMultipleFiles: async (files) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Xóa file
  deleteFile: async (filename) => {
    const response = await api.delete(`/upload/${filename}`)
    return response.data
  },
}
