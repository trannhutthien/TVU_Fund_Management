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

  // Upload ảnh đại diện
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload ảnh bìa quỹ
  uploadFundImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload/fund', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Upload ảnh sinh viên nổi bật
  uploadStudentImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload/student', formData, {
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
