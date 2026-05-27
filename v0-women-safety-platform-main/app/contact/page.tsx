import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <section>
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 mb-4">
              Have questions or feedback? We'd love to hear from you. Reach out to our team through any of the channels below.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:support@safeher.app" className="text-blue-600 hover:underline">
                      support@safeher.app
                    </a>
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Response time: Within 24 hours</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Phone</h3>
                  <p className="text-gray-600">
                    <a href="tel:1800-123-456" className="text-blue-600 hover:underline">
                      1800-123-456
                    </a>
                  </p>
                  <p className="text-gray-500 text-sm mt-1">Available: Mon-Fri, 9 AM - 6 PM</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Emergency Support</h3>
                  <p className="text-gray-600">
                    For immediate emergency assistance, use the SOS feature in the app or call 911
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Why Contact Us?</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-bold mb-1">Questions about SafeHer?</h3>
                  <p className="text-gray-600 text-sm">Get help with features and functionality</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-bold mb-1">Report an Issue?</h3>
                  <p className="text-gray-600 text-sm">Tell us about bugs or problems you've encountered</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-bold mb-1">Partnership Inquiries?</h3>
                  <p className="text-gray-600 text-sm">Connect with us for collaboration opportunities</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-bold mb-1">Volunteer Program?</h3>
                  <p className="text-gray-600 text-sm">Learn how to become a verified SafeHer volunteer</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">How quickly will help arrive?</h3>
                <p className="text-gray-600">Our verified volunteers are trained to respond quickly. Average response time is under 5 minutes in most areas.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Is SafeHer available nationwide?</h3>
                <p className="text-gray-600">Yes, SafeHer is available nationwide with volunteer networks in major cities and surrounding areas.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">How do I become a volunteer?</h3>
                <p className="text-gray-600">Visit our website and sign up as a volunteer. We conduct background checks and provide training to all volunteers.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Is my location data secure?</h3>
                <p className="text-gray-600">Yes, we use encrypted connections and secure servers to protect your location data and personal information.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Is SafeHer free to use?</h3>
                <p className="text-gray-600">SafeHer offers a free basic plan with essential features. Premium plans are available for additional benefits.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Office Address</h2>
            <p className="text-gray-600">
              SafeHer<br />
              Women Safety Platform<br />
              Available Nationwide<br />
              <br />
              <a href="mailto:support@safeher.app" className="text-blue-600 hover:underline">
                support@safeher.app
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
