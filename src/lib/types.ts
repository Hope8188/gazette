export interface CSVData {
  id: string
  name: string
  data: Record<string, string | number>[]
  headers: string[]
  summary: DataSummary
}

export interface DataSummary {
  totalRows: number
  numericColumns: string[]
  categoricalColumns: string[]
  statistics: Record<string, ColumnStats>
  topValues: Record<string, { value: string | number; count: number }[]>
}

export interface ColumnStats {
  min?: number
  max?: number
  mean?: number
  median?: number
  sum?: number
  uniqueCount: number
  nullCount: number
}

export interface MagazineSection {
  title: string
  subtitle?: string
  content: string
  highlights: Highlight[]
  chartData?: ChartData
  layout: 'full' | 'half' | 'third'
  accent?: string
}

export interface Highlight {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface MagazineIssue {
  title: string
  subtitle: string
  date: string
  edition: string
  sections: MagazineSection[]
  insights: string[]
  coverImage?: string
}

export interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error'
  message: string
  progress: number
}
