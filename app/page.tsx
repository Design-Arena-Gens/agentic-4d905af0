'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle, Clock, Inbox } from 'lucide-react'

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

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [processedEmails, setProcessedEmails] = useState<ProcessedEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [newEmail, setNewEmail] = useState({
    from: '',
    subject: '',
    body: ''
  })

  const processEmails = async () => {
    if (emails.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/process-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      })

      const data = await response.json()
      setProcessedEmails(data.processedEmails)
    } catch (error) {
      console.error('Error processing emails:', error)
    }
    setLoading(false)
  }

  const addEmail = () => {
    if (!newEmail.from || !newEmail.subject || !newEmail.body) return

    const email: Email = {
      id: Date.now().toString(),
      from: newEmail.from,
      subject: newEmail.subject,
      body: newEmail.body,
      timestamp: new Date()
    }

    setEmails([...emails, email])
    setNewEmail({ from: '', subject: '', body: '' })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عاجل': return 'text-red-600 bg-red-100'
      case 'متوسط': return 'text-yellow-600 bg-yellow-100'
      case 'منخفض': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'رد تلقائي': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'بحاجة لمراجعة': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'تجاهل': return <Clock className="w-5 h-5 text-gray-600" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Mail className="w-12 h-12" />
            نظام الرد الذكي على الإيميلات
          </h1>
          <p className="text-white/90 text-lg">
            نظام ذكي يقوم بفرز الإيميلات وتصنيفها والرد عليها تلقائياً حسب الأولوية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Add Email Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Inbox className="w-6 h-6" />
              إضافة إيميل جديد
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  من
                </label>
                <input
                  type="email"
                  value={newEmail.from}
                  onChange={(e) => setNewEmail({ ...newEmail, from: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="البريد الإلكتروني للمرسل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموضوع
                </label>
                <input
                  type="text"
                  value={newEmail.subject}
                  onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="موضوع الإيميل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحتوى
                </label>
                <textarea
                  value={newEmail.body}
                  onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="نص الإيميل"
                />
              </div>
              <button
                onClick={addEmail}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                إضافة إيميل
              </button>
            </div>
          </div>

          {/* Inbox */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              صندوق الوارد ({emails.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {emails.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد إيميلات</p>
              ) : (
                emails.map((email) => (
                  <div key={email.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="font-semibold text-gray-800">{email.subject}</div>
                    <div className="text-sm text-gray-600 mt-1">من: {email.from}</div>
                    <div className="text-sm text-gray-500 mt-2 line-clamp-2">{email.body}</div>
                  </div>
                ))
              )}
            </div>
            {emails.length > 0 && (
              <button
                onClick={processEmails}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {loading ? 'جاري المعالجة...' : 'معالجة الإيميلات'}
              </button>
            )}
          </div>
        </div>

        {/* Processed Emails */}
        {processedEmails.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              الإيميلات المعالجة ({processedEmails.length})
            </h2>
            <div className="space-y-4">
              {processedEmails.map((email) => (
                <div key={email.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getActionIcon(email.action)}
                        <h3 className="text-xl font-bold text-gray-800">{email.subject}</h3>
                      </div>
                      <p className="text-sm text-gray-600">من: {email.from}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(email.priority)}`}>
                      {email.priority}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {email.category}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 font-medium mb-2">محتوى الإيميل:</p>
                    <p className="text-gray-600">{email.body}</p>
                  </div>

                  {email.response && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-2">الرد المقترح:</p>
                      <p className="text-gray-700">{email.response}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      email.action === 'رد تلقائي' ? 'bg-green-100 text-green-700' :
                      email.action === 'بحاجة لمراجعة' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      الإجراء: {email.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
