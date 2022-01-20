export interface SnackbarMessage {
  text: string
  type: 'info' | 'alert' | 'success'
  duration?: number
}

export type SidebarState = 'open' | 'close'
