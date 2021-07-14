import useQueryParams from './useQueryParams'

const usePageNumber = () => {
  const pageParam = useQueryParams('p')
  const pageNumber = pageParam && parseInt(pageParam)

  return pageNumber || 1
}

export default usePageNumber
