'use client'

import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import Papa from 'papaparse'
import { CSVData, DataSummary, ColumnStats } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

interface CSVUploaderProps {
  onFilesProcessed: (files: CSVData[]) => void
  maxFiles?: number
}

export function CSVUploader({ onFilesProcessed, maxFiles = 10 }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)

  const analyzeData = (data: Record<string, string | number>[]): DataSummary => {
    if (data.length === 0) {
      return {
        totalRows: 0,
        numericColumns: [],
        categoricalColumns: [],
        statistics: {},
        topValues: {}
      }
    }

    const headers = Object.keys(data[0])
    const numericColumns: string[] = []
    const categoricalColumns: string[] = []
    const statistics: Record<string, ColumnStats> = {}
    const topValues: Record<string, { value: string | number; count: number }[]> = {}

    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(v => v !== '' && v !== null && v !== undefined)
      const numericValues = values.map(v => typeof v === 'number' ? v : parseFloat(v as string)).filter(v => !isNaN(v))
      
      if (numericValues.length > values.length * 0.8) {
        numericColumns.push(header)
        const sorted = numericValues.sort((a, b) => a - b)
        const sum = numericValues.reduce((a, b) => a + b, 0)
        statistics[header] = {
          min: sorted[0],
          max: sorted[sorted.length - 1],
          mean: sum / numericValues.length,
          median: sorted[Math.floor(sorted.length / 2)],
          sum: sum,
          uniqueCount: new Set(numericValues).size,
          nullCount: data.length - numericValues.length
        }
      } else {
        categoricalColumns.push(header)
        const valueCounts: Record<string, number> = {}
        values.forEach(v => {
          valueCounts[String(v)] = (valueCounts[String(v)] || 0) + 1
        })
        topValues[header] = Object.entries(valueCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([value, count]) => ({ value, count }))
        statistics[header] = {
          uniqueCount: new Set(values.map(v => String(v))).size,
          nullCount: data.length - values.length
        }
      }
    })

    return {
      totalRows: data.length,
      numericColumns,
      categoricalColumns,
      statistics,
      topValues
    }
  }

  const processFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return

    const csvFiles = Array.from(fileList).filter(file => 
      file.type === 'text/csv' || file.name.endsWith('.csv')
    )

    if (csvFiles.length === 0) return

    setProcessing(true)
    const processedFiles: CSVData[] = []

    for (const file of csvFiles.slice(0, maxFiles)) {
      try {
        const result = await new Promise<Papa.ParseResult<Record<string, string>>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: resolve,
            error: reject
          })
        })

        if (result.data && result.data.length > 0) {
          const data = result.data as Record<string, string | number>[]
          const summary = analyzeData(data)
          
          processedFiles.push({
            id: uuidv4(),
            name: file.name.replace('.csv', ''),
            data,
            headers: result.meta.fields || [],
            summary
          })
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
      }
    }

    setFiles(prev => [...prev, ...csvFiles.slice(0, maxFiles)])
    onFilesProcessed(processedFiles)
    setProcessing(false)
  }, [maxFiles, onFilesProcessed])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer",
          isDragging 
            ? "border-blue-400 bg-blue-500/10" 
            : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
        )}
      >
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={(e) => processFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
            isDragging ? "bg-blue-500/20" : "bg-slate-800 shadow-sm"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-blue-400" : "text-slate-400"
            )} />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-100">
              {processing ? 'Processing...' : 'Drop CSV files here'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              or click to browse (max {maxFiles} files)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Supports multiple CSV files</span>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
