import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="font-bold text-2xl text-blue-600">TechSwap</div>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn New Skills, Teach What You Know
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            TechSwap connects learners and teachers in a skill-sharing community. 
            Exchange knowledge, grow together, and build meaningful connections.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                I Have an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and tell us what skills you want to learn and what you can teach.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
              <p className="text-gray-600">
                Connect with people who want to learn what you teach and vice versa.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Swapping</h3>
              <p className="text-gray-600">
                Schedule sessions, share knowledge, and grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">About TechSwap</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-6">
              TechSwap was born from the idea that everyone has something valuable to teach 
              and something new to learn. Our platform bridges the gap between knowledge seekers 
              and knowledge sharers in the tech community.
            </p>
            <p className="text-lg text-gray-600">
              Whether you're a beginner looking to learn programming or an expert wanting to 
              share your experience, TechSwap provides the perfect environment for skill exchange.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Replace with actual team members */}
            {[1, 2, 3, 4, 5].map((member) => (
              <div key={member} className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="font-semibold">Team Member {member}</h3>
                <p className="text-gray-600 text-sm">Role</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Learning Journey?</h3>
          <p className="text-gray-300 mb-6">
            Join TechSwap today and become part of our growing community.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Join Now
            </Button>
          </Link>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p>&copy; 2024 TechSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}