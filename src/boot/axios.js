import axios, { AxiosError } from 'axios'
import { boot } from 'quasar/wrappers'

const $api = {
  backend: axios.create({
    baseURL: process.env.DEV
      ? 'https://ask-test-production.up.railway.app'
      : 'http://localhost:3000',
  })
}

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = $api

  function onFulfilled(response) {
    return response
  }

  function onRejected(error) {
    if (error instanceof AxiosError) {
      if (error.code !== 'ERR_CANCELED') {
        console.error(error)
      }

      const code = parseInt(error.response && error.response.status)

      if (!isNaN(code)) {
        console.error(
          `CODE: ${code} | STATUS: ${error.response.statusText} | URL: ${error.response.config.url} | DATA:`,
        )
        console.error(error.response?.data)
      }
    }

    throw error
  }

  app.config.globalProperties.$api.backend.interceptors.response.use(onFulfilled, onRejected)
})

export { $api }