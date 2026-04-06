'use client'

import { useState } from 'react'
import { 
  FileText,
  Zap, 
  Download,
  FileSpreadsheet,
  Layout,
  Clock,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Database
} from 'lucide-react'
import { BentoCard, BentoGrid } from '@/components/bento-card'
import { CSVUploader } from '@/components/csv-uploader'
import { CSVData, ProcessingStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [datasets, setDatasets] = useState<CSVData[]>([])
  const [status, setStatus] = useState<ProcessingStatus>({
    status: 'idle',
    message: 'Ready to process',
    progress: 0
  })

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
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Data to Magazine</span>
          </motion.div>
          
          <h1 className="font-display text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 animate-gradient">
              GAZETTE
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Transform raw CSV data into stunning, magazine-quality reports.
            <span className="text-slate-300"> Instant delivery.</span>
          </p>
        </motion.div>

        <BentoGrid columns={4} className="mb-12">
          <BentoCard
            size="lg"
            title="Upload & Generate"
            subtitle="Drop CSV files, then create PDF"
            icon={<FileSpreadsheet className="w-6 h-6 text-blue-400" />}
            delay={1}
            accent="blue"
          >
            <div className="space-y-4">
              <CSVUploader 
                onFilesProcessed={handleFilesProcessed}
                maxFiles={10}
              />
              {datasets.length > 0 && (
                <button
                  onClick={generateMagazine}
                  disabled={status.status === 'generating'}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                    status.status === 'generating'
                      ? "bg-slate-700 cursor-not-allowed text-slate-400"
                      : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {status.status === 'generating' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Generate PDF</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </BentoCard>

          <BentoCard
            title="Processing"
            subtitle={status.message}
            icon={<Zap className={cn(
              "w-6 h-6",
              status.status === 'generating' ? "text-amber-400 animate-pulse" : "text-slate-400"
            )} />}
            delay={2}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="font-semibold text-slate-200">{status.progress}%</span>
              </div>
              
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    status.status === 'error' ? "bg-red-500" :
                    status.status === 'complete' ? "bg-emerald-500" : "bg-blue-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress}%` }}
                />
              </div>

              {status.status === 'generating' && (
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating report...</span>
                </div>
              )}
              
              {status.status === 'complete' && (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Download complete</span>
                </div>
              )}
            </div>
          </BentoCard>

          <BentoCard
            title="Data Overview"
            subtitle="Current datasets"
            icon={<Database className="w-6 h-6 text-emerald-400" />}
            delay={3}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <div className="text-2xl font-bold text-slate-100">{stats.files}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Files</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <div className="text-2xl font-bold text-slate-100">
                  {stats.rows > 1000 ? (stats.rows / 1000).toFixed(1) + 'K' : stats.rows}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Rows</div>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-xl">
                <div className="text-2xl font-bold text-slate-100">{stats.columns}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Cols</div>
              </div>
            </div>
          </BentoCard>

        </BentoGrid>

        <AnimatePresence>
          {datasets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-slate-100">Uploaded Datasets</h2>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
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
                    transition={{ delay: index * 0.05 }}
                    className="glass-card p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-100">{dataset.name}</h3>
                        <p className="text-sm text-slate-400">
                          {dataset.summary.totalRows.toLocaleString()} rows × {dataset.headers.length} columns
                        </p>
                      </div>
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dataset.summary.numericColumns.slice(0, 3).map(col => (
                        <span key={col} className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full font-medium">
                          {col}
                        </span>
                      ))}
                      {dataset.summary.numericColumns.length > 3 && (
                        <span className="text-xs px-2.5 py-1 bg-slate-700/50 text-slate-400 rounded-full">
                          +{dataset.summary.numericColumns.length - 3}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 hover:bg-white/10 transition-colors group"
          >
            <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4 group-hover:bg-blue-500/30 transition-colors">
              <Layout className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">Magazine Layout</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professional bento-box style layouts that transform raw data into editorial-quality visuals.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 hover:bg-white/10 transition-colors group"
          >
            <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4 group-hover:bg-emerald-500/30 transition-colors">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">Hyper-Fast</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Optimized for sub-second analysis and generation. No waiting.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 hover:bg-white/10 transition-colors group"
          >
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4 group-hover:bg-purple-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-100 mb-2">Bulk Processing</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Process up to 10 CSV files simultaneously for comprehensive multi-dataset reports.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-slate-800 text-center"
        >
          <p className="text-sm text-slate-500">
            Built with Next.js & Tailwind
          </p>
        </motion.footer>
      </div>
    </main>
  )
}
