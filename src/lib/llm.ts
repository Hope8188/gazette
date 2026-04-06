import { MagazineIssue, MagazineSection, CSVData, Highlight } from '@/lib/types'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

const FAST_MODELS = [
  'google/gemini-2.5-pro-exp-03-25:free',
  'google/gemini-2.0-flash-thinking-exp:free',
  'google/gemini-2.0-flash-exp:free',
  'qwen/qwen2.5-vl-72b-instruct:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free'
]

interface LLMResponse {
  title: string
  subtitle: string
  sections: Array<{
    title: string
    subtitle?: string
    content: string
    highlights: Array<{
      label: string
      value: string
      change?: string
      trend?: 'up' | 'down' | 'neutral'
    }>
    layout: 'full' | 'half' | 'third'
    accent?: string
  }>
  insights: string[]
  executiveSummary: string
}

export async function generateMagazineContent(datasets: CSVData[]): Promise<MagazineIssue> {
  const dataContext = datasets.map(dataset => ({
    name: dataset.name,
    rows: dataset.summary.totalRows,
    headers: dataset.headers,
    numericColumns: dataset.summary.numericColumns,
    categoricalColumns: dataset.summary.categoricalColumns,
    statistics: dataset.summary.statistics,
    topValues: dataset.summary.topValues,
    sampleData: dataset.data.slice(0, 10)
  }))

  const prompt = `You are a professional data journalist and magazine editor. Create a compelling magazine-style report from this data.

DATASETS:
${JSON.stringify(dataContext, null, 2)}

TASK: Create a magazine-style report with the following structure:

1. Title: An engaging, professional title for the report
2. Subtitle: A compelling subtitle that captures the essence
3. Executive Summary: 2-3 paragraphs of narrative prose explaining key findings
4. Sections (3-5 sections, each with):
   - Title: Section headline
   - Subtitle: Optional supporting text
   - Content: 2-3 paragraphs of narrative text explaining the data story
   - Highlights: 3-5 key metrics with values, optional change % and trend direction
   - Layout: 'full', 'half', or 'third' based on importance
   - Accent: Optional hex color for visual distinction
5. Key Insights: 5-7 bullet points of actionable insights

OUTPUT FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "title": "...",
  "subtitle": "...",
  "executiveSummary": "...",
  "sections": [...],
  "insights": [...]
}

GUIDELINES:
- Write in professional, magazine-style prose
- Focus on trends, patterns, and stories in the data
- Make insights actionable and business-relevant
- Use specific numbers and percentages from the data
- Narrative should flow logically between sections
- Tone: authoritative yet accessible
- Avoid raw data dumps - transform numbers into insights
- Each highlight should tell part of the story

Return only valid JSON. No markdown, no code blocks, just raw JSON.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://gazette.app',
        'X-Title': 'Gazette Magazine Generator'
      },
      body: JSON.stringify({
        model: FAST_MODELS[0],
        messages: [
          {
            role: 'system',
            content: 'You are a professional data journalist specializing in creating compelling magazine-style reports from data. You excel at transforming raw data into engaging narratives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in LLM response')
    }

    let parsed: LLMResponse
    try {
      parsed = JSON.parse(content)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse LLM response')
      }
    }

    const sections: MagazineSection[] = parsed.sections.map(section => ({
      ...section,
      highlights: section.highlights || []
    }))

    return {
      title: parsed.title,
      subtitle: parsed.subtitle,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      edition: `Q${Math.floor((new Date().getMonth() + 3) / 3)} ${new Date().getFullYear()}`,
      sections,
      insights: parsed.insights,
      coverImage: undefined
    }
  } catch (error) {
    console.error('LLM Generation Error:', error)
    throw error
  }
}

export async function quickAnalyze(dataset: CSVData): Promise<string> {
  const prompt = `Quickly analyze this dataset and provide a 2-sentence summary:

Dataset: ${dataset.name}
Rows: ${dataset.summary.totalRows}
Columns: ${dataset.headers.join(', ')}
Numeric columns: ${dataset.summary.numericColumns.join(', ')}
Key stats: ${Object.entries(dataset.summary.statistics)
  .slice(0, 5)
  .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
  .join('; ')}

Provide only the summary text, no JSON.`

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://gazette.app',
      'X-Title': 'Gazette Magazine Generator'
    },
    body: JSON.stringify({
      model: FAST_MODELS[2],
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200
    })
  })

  if (!response.ok) throw new Error('Quick analysis failed')

  const result = await response.json()
  return result.choices[0]?.message?.content || 'No analysis available'
}
