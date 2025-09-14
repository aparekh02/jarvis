import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export function EnvDebugger() {
  const env = import.meta.env || {}
  
  const checks = [
    {
      name: 'Environment Object',
      key: 'env',
      value: !!env,
      expected: true,
      description: 'import.meta.env should be available'
    },
    {
      name: 'OpenAI API Key',
      key: 'VITE_OPENAI_API_KEY',
      value: env.VITE_OPENAI_API_KEY,
      expected: 'API key',
      description: 'For AI features and voice services'
    },
    {
      name: 'Google Classroom API Key',
      key: 'VITE_GOOGLE_CLASSROOM_API_KEY',
      value: env.VITE_GOOGLE_CLASSROOM_API_KEY,
      expected: 'API key',
      description: 'For syncing classroom assignments'
    }
  ]
  
  const getStatus = (check: any) => {
    if (check.key === 'env') {
      return check.value ? 'success' : 'error'
    }
    
    if (!check.value || check.value === 'your_openai_api_key_here' || check.value === 'your_google_classroom_api_key_here') {
      return 'warning'
    }
    
    return 'success'
  }
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default: return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Environment Configuration Debug
        </CardTitle>
        <p className="text-sm text-gray-600">
          Use this panel to verify your API configuration. Remove this component in production.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.map((check) => {
            const status = getStatus(check)
            return (
              <div key={check.key} className="flex items-start gap-3 p-3 border rounded-lg">
                {getIcon(status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{check.name}</h4>
                    <Badge variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                      {status === 'success' ? 'OK' : status === 'warning' ? 'Missing' : 'Error'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                  {check.value && status === 'success' && (
                    <p className="text-xs font-mono bg-green-50 p-1 rounded">
                      {check.key === 'env' ? 'Available' : `${check.value.substring(0, 10)}...`}
                    </p>
                  )}
                  {(!check.value || status === 'warning') && (
                    <p className="text-xs text-gray-500">
                      {check.key === 'env' ? 'import.meta.env is undefined' : `Add ${check.key} to your .env file`}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">🚀 Quick Fix Guide:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Copy <code>.env.example</code> to <code>.env</code></li>
              <li>2. Replace placeholder values with your actual API keys</li>
              <li>3. Restart your development server completely</li>
              <li>4. Refresh this page to see updated status</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}