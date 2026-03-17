export interface PageConfig {
  id: string
  userId: string
  notionPageId: string
  name: string
  description: string
  isDatabase: boolean
  databaseProps: string | null
  sortOrder: number
  createdAt: Date
}

export interface NotionPage {
  id: string
  title: string
  icon?: string | null
  isDatabase: boolean
}

export interface NotionWorkspace {
  id: string
  name: string
  icon?: string | null
}
