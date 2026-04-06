'use client'

import { useState } from 'react'
import { 
  FileText, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Download,
  ArrowRight,
  FileSpreadsheet,
  Layout,
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { BentoCard, BentoGrid } from '@/components/bento-card'
import { CSVUploader } from '@/components/csv-uploader'
import { CSVData, MagazineIssue, ProcessingStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [datasets, setDatasets] = useState<CSVData[]>([])
  const [status, setStatus] = useState<ProcessingStatus>({
    status: 'idle',
    message: 'Ready to process',
    progress: 0
  })
  const [generatedMagazine, setGeneratedMagazine] = useState<MagazineIssue | null>(null)

  const handleFilesProcessed = (files: CSVData[]) => {
    setDatasets(prev => [...prev, ...files])
    setStatus({
      status: 'idle',
      message: `${files.length} file(s) loaded`,
      progress: 25
    })
  }

  const generateMagazine = async () => {
    if (datasets.length === 0) return

    setStatus({
      status: 'generating',
      message: 'Analyzing data with AI...',
      progress: 50
    })

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasets })
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `magazine-report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setStatus({
        status: 'complete',
        message: 'Magazine generated successfully!',
        progress: 100
      })
    } catch (error) {
      setStatus({
        status: 'error',
        message: 'Generation failed. Please try again.',
        progress: 0
      })
    }
  }

  const clearAll = () => {
    setDatasets([])
    setGeneratedMagazine(null)
    setStatus({
      status: 'idle',
      message: 'Ready to process',
      progress: 0
    })
  }

  const stats = {
    files: datasets.length,
    rows: datasets.reduce((acc, d) => acc + d.summary.totalRows, 0),
    columns: datasets.reduce((acc, d) => acc + d.headers.length, 0)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Data Stories</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Gazette
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform your CSV data into beautiful, magazine-style reports. 
            Powered by advanced AI for instant insights.
          </p>
        </motion.div>

        <BentoGrid columns={4} className="mb-8">
          <BentoCard
            size="lg"
            title="Upload Data"
            subtitle="Drop multiple CSV files"
            icon={<FileSpreadsheet className="w-6 h-6 text-blue-600" />}
            delay={1}
          >
            <CSVUploader 
              onFilesProcessed={handleFilesProcessed}
              maxFiles={10}
            />
          </BentoCard>

          <BentoCard
            title="Status"
            subtitle={status.message}
            icon={<Zap className={cn(
              "w-6 h-6",
              status.status === 'generating' ? "text-amber-500 animate-pulse" : "text-slate-600"
            )} />}
            delay={2}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium text-slate-900">{status.progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    status.status === 'error' ? "bg-red-500" :
                    status.status === 'complete' ? "bg-green-500" : "bg-blue-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                />
              </div>
              {status.status === 'generating' && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with Gemini 2.5 Pro...</span>
                </div>
              )}
            </div>
          </BentoCard>

          <BentoCard
            title="Statistics"
            subtitle="Current datasets"
            icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
            delay={3}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.files}</div>
                <div className="text-xs text-slate-500">Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.rows > 1000 ? (stats.rows / 1000).toFixed(1) + 'K' : stats.rows}
                </div>
                <div className="text-xs text-slate-500">Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.columns}</div>
                <div className="text-xs text-slate-500">Columns</div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            gradient
            title="Generate"
            subtitle="Create magazine PDF"
            icon={<FileText className="w-6 h-6 text-white" />}
            delay={4}
            className={cn(
              datasets.length === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex flex-col h-full justify-between">
              <p className="text-white/80 text-sm">
                Transform your data into a professional magazine report with AI-generated insights.
              </p>
              <button
                onClick={generateMagazine}
                disabled={datasets.length === 0 || status.status === 'generating'}
                className={cn(
                  "mt-4 w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                  datasets.length === 0 || status.status === 'generating'
                    ? "bg-white/20 cursor-not-allowed"
                    : "bg-white text-blue-600 hover:bg-white/90 hover:scale-[1.02]"
                )}
              >
                {status.status === 'generating' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          </BentoCard>
        </BentoGrid>

        {datasets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Uploaded Datasets</h2>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{dataset.name}</h3>
                      <p className="text-sm text-slate-500">
                        {dataset.summary.totalRows.toLocaleString()} rows × {dataset.headers.length} columns
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dataset.summary.numericColumns.slice(0, 3).map(col => (
                      <span key={col} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        {col}
                      </span>
                    ))}
                    {dataset.summary.numericColumns.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                        +{dataset.summary.numericColumns.length - 3} more
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Layout className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Magazine Layout</h3>
              <p className="text-sm text-slate-600 mt-1">
                Professional bento-box style layouts that organize your data beautifully.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Hyper-Fast</h3>
              <p className="text-sm text-slate-600 mt-1">
                Optimized with Gemini 2.5 Pro for instant analysis and generation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <ArrowRight className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Multiple Files</h3>
              <p className="text-sm text-slate-600 mt-1">
                Process up to 10 CSV files simultaneously for comprehensive reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
