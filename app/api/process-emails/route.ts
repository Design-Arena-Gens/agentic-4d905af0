import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo',
})

interface Email {
  id: string
  from: string
  subject: string
  body: string
  timestamp: Date
}

interface ProcessedEmail extends Email {
  category: string
  priority: 'عاجل' | 'متوسط' | 'منخفض'
  response?: string
  action: 'رد تلقائي' | 'بحاجة لمراجعة' | 'تجاهل'
}

// Simulated AI processing for demo purposes
function simulateAIProcessing(email: Email): ProcessedEmail {
  const body = email.body.toLowerCase()
  const subject = email.subject.toLowerCase()

  let category = 'عام'
  let priority: 'عاجل' | 'متوسط' | 'منخفض' = 'منخفض'
  let action: 'رد تلقائي' | 'بحاجة لمراجعة' | 'تجاهل' = 'رد تلقائي'
  let response = ''

  // Categorization logic
  if (body.includes('طلب') || body.includes('استفسار') || subject.includes('سؤال')) {
    category = 'استفسارات'
    priority = 'متوسط'
    action = 'رد تلقائي'
    response = `شكراً لتواصلك معنا بخصوص: ${email.subject}.\n\nتم استلام استفسارك وسيتم الرد عليك في أقرب وقت ممكن. فريقنا يعمل على مراجعة طلبك والإجابة على جميع أسئلتك.\n\nمع تحياتنا،\nفريق الدعم`
  } else if (body.includes('شكوى') || body.includes('مشكلة') || body.includes('خطأ')) {
    category = 'شكاوى'
    priority = 'عاجل'
    action = 'بحاجة لمراجعة'
    response = `عزيزي العميل،\n\nنعتذر عن أي إزعاج قد تسبب. تم تصنيف رسالتك كأولوية عاجلة وسيقوم فريق الدعم الفني بالتواصل معك خلال 24 ساعة لحل المشكلة.\n\nنقدر صبرك وتفهمك.\n\nمع تحياتنا،\nفريق الدعم`
  } else if (body.includes('عاجل') || body.includes('urgent') || body.includes('ضروري')) {
    category = 'عاجل'
    priority = 'عاجل'
    action = 'بحاجة لمراجعة'
    response = `تم استلام رسالتك العاجلة. سيتم التواصل معك في أقرب وقت ممكن من قبل أحد أعضاء فريقنا.\n\nشكراً لك.`
  } else if (body.includes('فاتورة') || body.includes('دفع') || body.includes('مالي')) {
    category = 'أمور مالية'
    priority = 'متوسط'
    action = 'رد تلقائي'
    response = `شكراً لتواصلك معنا بخصوص الأمور المالية.\n\nتم استلام طلبك وسيقوم قسم المحاسبة بمراجعته والرد عليك خلال 48 ساعة.\n\nمع تحياتنا،\nقسم المحاسبة`
  } else if (body.includes('تسويق') || body.includes('إعلان') || body.includes('عرض')) {
    category = 'تسويق'
    priority = 'منخفض'
    action = 'تجاهل'
  } else if (body.includes('شكر') || body.includes('تقدير')) {
    category = 'ملاحظات إيجابية'
    priority = 'منخفض'
    action = 'رد تلقائي'
    response = `شكراً جزيلاً على كلماتك الطيبة!\n\nيسعدنا أن نكون قد لبينا توقعاتك. نحن دائماً في خدمتك.\n\nمع أطيب التحيات،\nفريق العمل`
  } else {
    category = 'عام'
    priority = 'منخفض'
    action = 'رد تلقائي'
    response = `شكراً لتواصلك معنا.\n\nتم استلام رسالتك وسيتم مراجعتها من قبل الفريق المختص.\n\nمع تحياتنا،\nفريق الدعم`
  }

  return {
    ...email,
    category,
    priority,
    response: action === 'تجاهل' ? undefined : response,
    action
  }
}

async function processWithOpenAI(email: Email): Promise<ProcessedEmail> {
  try {
    const prompt = `أنت نظام ذكي لمعالجة الإيميلات. قم بتحليل الإيميل التالي وقدم:
1. التصنيف (استفسارات، شكاوى، أمور مالية، تسويق، عام، إلخ)
2. الأولوية (عاجل، متوسط، منخفض)
3. الإجراء المقترح (رد تلقائي، بحاجة لمراجعة، تجاهل)
4. رد مقترح (إذا كان الإجراء رد تلقائي أو بحاجة لمراجعة)

الإيميل:
من: ${email.from}
الموضوع: ${email.subject}
المحتوى: ${email.body}

الرجاء الرد بصيغة JSON التالية:
{
  "category": "التصنيف",
  "priority": "الأولوية",
  "action": "الإجراء",
  "response": "الرد المقترح"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "أنت مساعد ذكي لمعالجة الإيميلات باللغة العربية. قدم ردوداً احترافية ومناسبة."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    return {
      ...email,
      category: result.category || 'عام',
      priority: result.priority || 'منخفض',
      action: result.action || 'رد تلقائي',
      response: result.response
    }
  } catch (error) {
    console.error('OpenAI API error, falling back to simulated processing:', error)
    return simulateAIProcessing(email)
  }
}

export async function POST(request: Request) {
  try {
    const { emails } = await request.json()

    if (!Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Process all emails
    const processedEmails: ProcessedEmail[] = []

    for (const email of emails) {
      // Use OpenAI if API key is available, otherwise use simulation
      const processed = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo'
        ? await processWithOpenAI(email)
        : simulateAIProcessing(email)

      processedEmails.push(processed)
    }

    return NextResponse.json({ processedEmails })
  } catch (error) {
    console.error('Error processing emails:', error)
    return NextResponse.json(
      { error: 'Failed to process emails' },
      { status: 500 }
    )
  }
}
