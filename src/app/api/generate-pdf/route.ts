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

    const magazine = await generateMagazineContent(datasets)
    const pdf = await generatePDF(magazine)

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${magazine.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
