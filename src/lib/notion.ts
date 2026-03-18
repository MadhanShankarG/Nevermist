import { Client } from '@notionhq/client'

interface PropertyMapping {
  priorityPropName: string | null
  dueDatePropName: string | null
  titlePropName: string
  isAmbiguous: boolean
}

/**
 * Detects property mapping for a Notion database.
 * Auto-maps Priority (Select) and Due Date (Date) properties.
 */
export async function detectPropertyMapping(
  databaseId: string,
  token: string
): Promise<PropertyMapping> {
  const notion = new Client({ auth: token })

  const database = await notion.databases.retrieve({ database_id: databaseId })

  const properties = database.properties
  let priorityPropName: string | null = null
  let dueDatePropName: string | null = null
  let titlePropName = 'Name'
  let isAmbiguous = false

  const priorityKeywords = ['priority', 'status', 'urgency', 'importance']
  const dueDateKeywords = ['due', 'due date', 'deadline', 'date', 'due_date']

  const selectProps: string[] = []
  const dateProps: string[] = []

  for (const [name, prop] of Object.entries(properties)) {
    const propType = prop.type

    // Find the title property
    if (propType === 'title') {
      titlePropName = name
    }

    // Find Select properties that could be Priority
    if (propType === 'select' || propType === 'status') {
      const nameLower = name.toLowerCase()
      if (priorityKeywords.some((k) => nameLower.includes(k))) {
        priorityPropName = name
      }
      selectProps.push(name)
    }

    // Find Date properties that could be Due Date
    if (propType === 'date') {
      const nameLower = name.toLowerCase()
      if (dueDateKeywords.some((k) => nameLower.includes(k))) {
        dueDatePropName = name
      }
      dateProps.push(name)
    }
  }

  // If no match was found but there are options, mark as ambiguous
  if (!priorityPropName && selectProps.length > 0) {
    isAmbiguous = true
  }
  if (!dueDatePropName && dateProps.length > 0) {
    isAmbiguous = true
  }

  return {
    priorityPropName,
    dueDatePropName,
    titlePropName,
    isAmbiguous,
  }
}

/**
 * Creates a Notion client from a decrypted access token.
 */
export function createNotionClient(token: string): Client {
  return new Client({ auth: token })
}
