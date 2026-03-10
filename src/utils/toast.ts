import { toast, ToastOptions } from 'react-toastify'

/** Default options shared by all toasts */
const BASE: ToastOptions = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const showToast = {
  /** ✅ Success — green */
  success: (msg: any, opts: any = {}) =>
    toast.success(msg, { ...BASE, ...opts }),

  /** ❌ Error — red */
  error: (msg: any, opts: any = {}) =>
    toast.error(msg, { ...BASE, autoClose: 5000, ...opts }),

  /** ⚠️ Warning — yellow */
  warn: (msg: any, opts: any = {}) =>
    toast.warn(msg, { ...BASE, ...opts }),

  /** ℹ️ Info — blue */
  info: (msg: any, opts: any = {}) =>
    toast.info(msg, { ...BASE, ...opts }),

  /** ⏳ Promise — shows loading → success/error automatically */
  promise: (promise: Promise<any>, { loading, success, error }: any = {}) =>
    toast.promise(promise, {
      pending: loading  || 'Loading…',
      success: success  || 'Done!',
      error:   error    || 'Something went wrong',
    }, BASE as any),

  /** Dismiss all */
  dismiss: () => toast.dismiss(),
}

export default showToast
