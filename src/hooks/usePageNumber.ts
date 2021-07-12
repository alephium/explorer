import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import useQueryParams from './useQueryParams'

const usePageNumber = () => {
  const history = useHistory()
  const location = history.location
  const page = parseInt(useQueryParams('p') || '1')

  // Default page query param
  useEffect(() => {
    history.replace(location.pathname + '?p=1')
  }, [history, location.pathname])

  return page
}

export default usePageNumber
