import { Component } from "react"
import type { ReactNode, ErrorInfo } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

interface Props {
  children: ReactNode
  /** Fallback UI to show when an error occurs */
  fallback?: (error: Error, resetError: () => void) => ReactNode
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)

    this.setState({
      errorInfo,
    })

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to log this to an error reporting service
    // e.g., Sentry.captureException(error, { extra: errorInfo })
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError)
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-red-500/20 bg-red-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <span className="text-2xl">⚠️</span>
                發生錯誤
              </CardTitle>
              <CardDescription>應用程式遇到了意外錯誤</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4">
                <p className="font-mono text-sm text-red-400">{this.state.error.message}</p>
              </div>

              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="rounded-lg border border-red-500/20 bg-red-950/20 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-red-400">
                    錯誤堆疊 (開發模式)
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-red-300">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={this.resetError}>
                  重試
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  重新載入頁面
                </Button>
                <Button onClick={() => (window.location.href = "/")} variant="ghost">
                  返回首頁
                </Button>
              </div>

              {import.meta.env.PROD && (
                <p className="text-xs text-slate-400">
                  如果問題持續發生，請聯繫技術支援並提供此錯誤訊息。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Utility function to create a custom error boundary with specific error handling
 */
export function createErrorBoundary(
  fallback?: (error: Error, resetError: () => void) => ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function CustomErrorBoundary({ children }: { children: ReactNode }) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        {children}
      </ErrorBoundary>
    )
  }
}
