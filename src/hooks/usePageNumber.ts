import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import useQueryParams from './useQueryParams'

const usePageNumber = () => {
  const pageParam = useQueryParams('p')
  const pageNumber = pageParam && parseInt(pageParam)
  const history = useHistory()
  const location = history.location

  const locationSearch = useMemo(() => new URLSearchParams(location.search), [location.search])

  if (pageNumber === 1) {
    locationSearch.delete('p')
    history.replace({ search: locationSearch.toString() })
  }

  return pageNumber || 1
}

export default usePageNumber
