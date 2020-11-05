import { useCallback, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

const useTableDetailsState = (defaultState: boolean) => {
  const [detailOpen, setDetailOpen] = useState(defaultState)
  
  const { pathname } = useLocation()
  
  useEffect(() => {
    // Close details when location is changing
    // TODO: Store state in URL? Careful, can become complex when we'll have paging
    setDetailOpen(false)
  }, [pathname])
  
  const toggleDetail = useCallback(() => setDetailOpen(!detailOpen), [detailOpen])

  return {detailOpen, setDetailOpen, toggleDetail}
}

export default useTableDetailsState