export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Brain Bridge</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect your local brain folder to ChatGPT. Ideate with context. Export Claude-ready plans.
          </p>

          <div className="space-y-4">
            <a
              href="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Get Started
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Search Locally</h3>
              <p className="text-gray-600">ChatGPT searches your local brain folder in real-time.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Create & Append</h3>
              <p className="text-gray-600">Ideate with ChatGPT and save plans directly to your vault.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Export Plans</h3>
              <p className="text-gray-600">Generate Claude Code-ready implementation briefs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
