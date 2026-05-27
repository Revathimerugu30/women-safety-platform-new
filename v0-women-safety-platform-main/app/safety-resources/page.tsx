import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function SafetyResourcesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <section>
            <h1 className="text-4xl font-bold mb-4">Safety Resources</h1>
            <p className="text-lg text-gray-600 mb-4">
              Access comprehensive safety resources, tips, and guidelines to help you stay safe in various situations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Emergency Contacts</h2>
            <div className="space-y-3 text-gray-600">
              <p><strong>Emergency Services:</strong> 911</p>
              <p><strong>National Domestic Violence Hotline:</strong> 1-800-799-7233</p>
              <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
              <p><strong>Sexual Assault Hotline:</strong> 1-800-656-4673</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Safety Tips</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Personal Safety</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Always trust your instincts</li>
                  <li>Stay aware of your surroundings</li>
                  <li>Keep your phone charged</li>
                  <li>Share your location with trusted contacts</li>
                  <li>Take self-defense classes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Home Safety</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Install proper locks and security systems</li>
                  <li>Keep emergency numbers posted</li>
                  <li>Never open the door to strangers</li>
                  <li>Have a safety plan in place</li>
                  <li>Consider a personal alarm system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Traveling Safety</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Plan your route in advance</li>
                  <li>Let someone know your plans</li>
                  <li>Use well-lit, populated areas</li>
                  <li>Keep valuables hidden</li>
                  <li>Stay alert on public transportation</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How to Use SafeHer</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">1. Set Up Your Profile</h3>
                <p className="text-gray-600">Create your account and add emergency contacts who will be notified during an emergency.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">2. Enable Location Sharing</h3>
                <p className="text-gray-600">Allow SafeHer to access your location so volunteers can find you quickly during emergencies.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">3. One-Tap SOS</h3>
                <p className="text-gray-600">In case of emergency, press the SOS button. Your location and emergency alert will be instantly shared with nearby volunteers.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">4. Stay Connected</h3>
                <p className="text-gray-600">Receive real-time updates about volunteer response and stay in contact with responders.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Resources & Support</h2>
            <div className="space-y-3 text-gray-600">
              <p>• <strong>Self-Defense Classes:</strong> Look for local programs in your community</p>
              <p>• <strong>Counseling Services:</strong> Available through national hotlines and local organizations</p>
              <p>• <strong>Legal Assistance:</strong> Contact local legal aid organizations</p>
              <p>• <strong>Support Groups:</strong> Join online and offline communities for support</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
