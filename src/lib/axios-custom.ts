import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const baseURL = 'http://localhost:8080'

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true // check this
})

export function getCookie(name: string) {
  const value = '; ' + document.cookie
  const parts = value.split('; ' + name + '=')

  if (parts.length == 2) {
    const cookiePart = parts.pop()
    return cookiePart ? cookiePart.split(';').shift() : `Cookie with name: ${name} not found`
  }
}

// Track if token refresh is in progress
let isRefreshing = false
// Queue of failed requests to retry after token refresh
let failedQueue: { resolve: Function; reject: Function }[] = []

// Process the queue of failed requests
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })

  failedQueue = []
}

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    console.log('Response error:', error)
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Don't retry if the request has already been retried
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Check for 401 status or network error that might be due to expired token
    const isAuthError = error.response && error.response.status === 401 && !originalRequest._retry

    if (!isAuthError) {
      return Promise.reject(error)
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true

    // If token refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          return instance(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    isRefreshing = true

    try {
      // Call the refresh token endpoint
      await instance.post('/api/auth/refresh', {}, { withCredentials: true })

      // Process the queue with no error
      processQueue(null)

      // Retry the original request
      return instance(originalRequest)
    } catch (refreshError) {
      // If refresh fails, process the queue with the error
      processQueue(refreshError as AxiosError)

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default instance
