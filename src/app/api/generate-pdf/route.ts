import { NextRequest, NextResponse } from 'next/server'
import { generateMagazineContent } from '@/lib/llm'
import { generatePDF } from '@/lib/pdf-generator'
import { CSVData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { datasets } = body as { datasets: CSVData[] }

    if (!datasets || datasets.length === 0) {
      return NextResponse.json(
        { error: 'No datasets provided' },
        { status: 400 }
      )
    }

    console.log('Generating magazine content with datasets:', datasets.length)
    const magazine = await generateMagazineContent(datasets)
    console.log('Magazine content generated:', magazine.title)
    
    console.log('Generating PDF...')
    const pdf = await generatePDF(magazine)
    console.log('PDF generation complete. Size:', pdf.length)
 
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${magazine.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('CRITICAL ERROR IN ROUTE:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
