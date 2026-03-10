/**
 * Format a number as Indian currency (₹)
 */
export const formatCurrency = (value: any, symbol = '₹') => {
  if (value === null || value === undefined || isNaN(value)) return `${symbol}0`
  return `${symbol}${Number(value).toLocaleString('en-IN')}`
}

/**
 * Capitalize the first letter of a string
 */
export const capitalize = (str: any) => {
  if (!str || typeof str !== 'string') return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Get initials from a full name
 */
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format a date string to readable format
 */
export const formatDate = (dateString: any, options: any = {}) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

/**
 * Return relative time string (e.g. "2 min ago")
 */
export const timeAgo = (dateString: any) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

/**
 * Truncate a string
 */
export const truncate = (str: any, max = 30) => {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

/**
 * Combine classnames conditionally (lightweight clsx)
 */
export const cn = (...classes: any[]) => classes.filter(Boolean).join(' ')


// i want integrate local store function set item getitem and remove and all removeitem

export const setLocalStorageItem = (key: string, value: string) => {
  localStorage.setItem(key, value)
}

export const getLocalStorageItem = (key: string) => {
  return localStorage.getItem(key)
}

export const removeLocalStorageItem = (key: string) => {
  localStorage.removeItem(key)
}

export const removeAllLocalStorageItems = () => {
  localStorage.clear()
}