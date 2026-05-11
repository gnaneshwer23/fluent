import React from 'react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-medium mb-6 bg-white shadow-sm">
              AI-Native Healthcare Intelligence Platform
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
              Akeno Nexus
            </h1>

            <p className="mt-6 text-2xl font-semibold text-gray-700">
              The Healthcare Intelligence Operating System
            </p>

            <p className="mt-8 text-lg leading-8 text-gray-600 max-w-2xl">
              Transform fragmented healthcare data into a living intelligence network using AI, knowledge graphs, GraphRAG, and real-time scientific insights.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-2xl px-8 py-4 bg-black text-white font-semibold shadow-lg hover:scale-105 transition-transform">
                Request Demo
              </button>

              <button className="rounded-2xl px-8 py-4 border border-gray-300 bg-white font-semibold hover:bg-gray-50 transition">
                Explore Platform
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-500">
              <div>
                <div className="text-2xl font-bold text-black">10M+</div>
                HCP Entities
              </div>
              <div>
                <div className="text-2xl font-bold text-black">Real-Time</div>
                Intelligence
              </div>
              <div>
                <div className="text-2xl font-bold text-black">Graph AI</div>
                Relationships
              </div>
              <div>
                <div className="text-2xl font-bold text-black">Predictive</div>
                Insights
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg">Scientific Intelligence Graph</h3>
                  <p className="text-sm text-gray-500">Live relationship intelligence</p>
                </div>
                <div className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                  Live
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <div className="text-sm text-gray-500">AI Query</div>
                  <div className="font-medium mt-1">
                    “Find emerging oncology KOLs in immunotherapy.”
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm text-gray-500">InfluenceDNA™</div>
                    <div className="text-3xl font-bold mt-2">92</div>
                    <div className="text-xs text-gray-500 mt-1">Rising Influence Score</div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm text-gray-500">Connected Trials</div>
                    <div className="text-3xl font-bold mt-2">27</div>
                    <div className="text-xs text-gray-500 mt-1">Active Networks</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-5 border border-gray-100">
                  <div className="text-sm font-semibold">AI Insight</div>
                  <p className="mt-2 text-sm text-gray-700 leading-6">
                    Emerging scientific momentum detected across NSCLC immunotherapy collaboration networks in Germany and Switzerland.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium mb-6">
            The Problem
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold max-w-4xl mx-auto leading-tight">
            Healthcare data is fragmented.
            Intelligence is missing.
          </h2>

          <p className="mt-8 text-lg text-gray-600 max-w-3xl mx-auto leading-8">
            Pharma and healthcare organizations operate across disconnected CRMs, publications, trials, and engagement systems — making scientific intelligence reactive instead of predictive.
          </p>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              'Static HCP profiles',
              'Disconnected scientific data',
              'Late KOL identification',
              'Poor investigator discovery',
              'Manual medical insights',
              'No relationship intelligence'
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-gray-200 p-8 bg-white shadow-sm">
                <div className="text-xl font-semibold">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-medium mb-6">
              Platform Capabilities
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              A living intelligence network for healthcare
            </h2>
          </div>

          <div className="mt-20 grid lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Knowledge Graph Engine',
                desc: 'Connect HCPs, trials, institutions, publications, and scientific relationships into a dynamic graph infrastructure.'
              },
              {
                title: 'GraphRAG AI Copilot',
                desc: 'Ask natural language questions and receive context-aware healthcare intelligence powered by graph-native AI.'
              },
              {
                title: 'Emerging KOL Detection',
                desc: 'Identify rising healthcare experts before traditional systems recognize their influence.'
              },
              {
                title: 'Investigator Discovery',
                desc: 'Find the best clinical investigators and sites using AI-powered relevance and recruitment scoring.'
              },
              {
                title: 'InfluenceDNA™',
                desc: 'Measure scientific influence using publication momentum, collaboration strength, and network centrality.'
              },
              {
                title: 'Real-Time Intelligence',
                desc: 'Continuously ingest and enrich scientific data streams from publications, trials, and healthcare ecosystems.'
              }
            ].map((feature) => (
              <div key={feature.title} className="rounded-3xl bg-white p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="mt-4 text-gray-600 leading-7">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium mb-6">
              Use Cases
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Built for modern healthcare intelligence teams
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Medical Affairs',
              'Clinical Operations',
              'Commercial Pharma',
              'CRO Investigator Discovery',
              'Scientific Monitoring',
              'KOL Mapping',
              'Trial Recruitment',
              'Healthcare Market Intelligence'
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-gray-200 p-6 text-center font-semibold bg-white">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-medium mb-6">
            Future of Healthcare Intelligence
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
            Beyond HCP 360.
            <br />
            Welcome to living intelligence.
          </h2>

          <p className="mt-8 text-lg text-gray-300 max-w-3xl mx-auto leading-8">
            Akeno Nexus helps healthcare organizations identify the right experts, relationships, and scientific opportunities before competitors do.
          </p>

          <div className="mt-12 flex justify-center gap-4 flex-wrap">
            <button className="rounded-2xl bg-white text-black px-8 py-4 font-semibold hover:scale-105 transition-transform">
              Schedule Demo
            </button>

            <button className="rounded-2xl border border-white/20 px-8 py-4 font-semibold hover:bg-white/10 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="text-xl font-bold">Akeno Nexus</div>
            <div className="text-sm text-gray-500 mt-1">
              The Healthcare Intelligence Operating System
            </div>
          </div>

          <div className="text-sm text-gray-500">
            © 2026 Akeno Nexus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
