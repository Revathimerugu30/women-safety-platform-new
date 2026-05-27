import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <section>
            <h1 className="text-4xl font-bold mb-4">About SafeHer</h1>
            <p className="text-lg text-gray-600 mb-4">
              SafeHer is a comprehensive women safety platform dedicated to empowering women with instant emergency assistance. Our mission is to create a safer world by connecting women in need with a network of verified volunteers and emergency services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              We believe every woman deserves to feel safe. By combining technology with community support, we provide a reliable safety network that responds within minutes during emergencies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Why Choose SafeHer?</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>One-click SOS emergency alerts</li>
              <li>Real-time GPS location sharing</li>
              <li>Verified volunteer network with background checks</li>
              <li>Integration with nearby emergency services</li>
              <li>24/7 availability for assistance</li>
              <li>Average response time under 5 minutes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">10K+</p>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">500+</p>
                <p className="text-gray-600">Verified Volunteers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">2K+</p>
                <p className="text-gray-600">Emergencies Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">&lt;3min</p>
                <p className="text-gray-600">Avg Response Time</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Safety First</h3>
                <p className="text-gray-600">Your safety is our top priority in every feature we build.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Community</h3>
                <p className="text-gray-600">We believe in the power of community support and solidarity.</p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Innovation</h3>
                <p className="text-gray-600">We continuously innovate to provide better safety solutions.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
