import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import useQueryParams from './useQueryParams'

const usePageNumber = () => {
  const history = useHistory()
  const location = history.location
  const pageParam = useQueryParams('p')
  const pageNumber = pageParam && parseInt(pageParam)

  // Default page query param
  useEffect(() => {
    if (!pageParam) history.replace(location.pathname + '?p=1')
  }, [history, location.pathname, pageParam])

  return pageNumber || 1
}

export default usePageNumber
