import React from "react";
import { ArrowRight, Coins, Users, BookOpen, ArrowLeftRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6 shadow-sm bg-white">
        <h1 className="text-2xl font-bold text-indigo-600">TechSwap</h1>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
          <a href="#about" className="hover:text-indigo-600">About</a>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700">
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-24 gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Swap <span className="text-indigo-600">Skills</span>, 
            <br /> Earn <span className="text-yellow-500">Coins</span>, 
            <br /> Learn Together.
          </h2>
          <p className="text-gray-600 text-lg max-w-lg">
            Join a community of developers, designers, and tech learners. 
            Exchange knowledge, teach others, and earn digital coins for your time.
          </p>
          <div className="flex gap-4">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 flex items-center gap-2">
              Join Now <ArrowRight size={18} />
            </button>
            <button className="border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-100">
              Learn More
            </button>
          </div>
        </div>
        <div className="flex-1">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0wa7oZzoIk5lULMsLxFphn1Zvhh85B0Ahww&s"
            alt="Tech learning illustration"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="text-center mb-14">
          <h3 className="text-3xl font-bold text-gray-900">Platform Features</h3>
          <p className="text-gray-600 mt-3">Everything you need to learn and teach efficiently.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-8">
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-md transition">
            <ArrowLeftRight className="text-indigo-600 mb-4" size={32} />
            <h4 className="font-semibold text-lg mb-2">Skill Swapping</h4>
            <p className="text-gray-600 text-sm">
              Exchange your knowledge with others and grow together through personalized sessions.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-md transition">
            <Coins className="text-yellow-500 mb-4" size={32} />
            <h4 className="font-semibold text-lg mb-2">Earn & Spend Coins</h4>
            <p className="text-gray-600 text-sm">
              Teach others to earn coins, then use them to book sessions or access premium resources.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow hover:shadow-md transition">
            <BookOpen className="text-green-600 mb-4" size={32} />
            <h4 className="font-semibold text-lg mb-2">Community Learning</h4>
            <p className="text-gray-600 text-sm">
              Join study groups, attend live coding sessions, and build your professional network.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="text-center mb-14">
          <h3 className="text-3xl font-bold text-gray-900">Simple Pricing</h3>
          <p className="text-gray-600 mt-3">Start free, then upgrade as you grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-8">
          <div className="p-8 bg-gray-50 rounded-2xl text-center shadow hover:shadow-md transition">
            <h4 className="font-semibold text-xl mb-4">Free</h4>
            <p className="text-4xl font-bold mb-4">0<span className="text-lg font-medium">/mo</span></p>
            <p className="text-gray-600 mb-6">Join and start learning for free.</p>
            <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50">
              Start Now
            </button>
          </div>
          <div className="p-8 bg-indigo-600 text-white rounded-2xl text-center shadow-lg hover:shadow-xl transition scale-105">
            <h4 className="font-semibold text-xl mb-4">Pro Learner</h4>
            <p className="text-4xl font-bold mb-4">$9<span className="text-lg font-medium">/mo</span></p>
            <p className="mb-6">Access premium mentors and group sessions.</p>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-gray-100">
              Upgrade
            </button>
          </div>
          <div className="p-8 bg-gray-50 rounded-2xl text-center shadow hover:shadow-md transition">
            <h4 className="font-semibold text-xl mb-4">Organization</h4>
            <p className="text-4xl font-bold mb-4">$29<span className="text-lg font-medium">/mo</span></p>
            <p className="text-gray-600 mb-6">For schools and learning platforms.</p>
            <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-gray-400 text-center">
        <p>© {new Date().getFullYear()} TechSwap. All rights reserved.</p>
        <div className="flex justify-center mt-4 gap-4 text-sm">
          <a href="#terms" className="hover:text-white">Terms</a>
          <a href="#privacy" className="hover:text-white">Privacy</a>
          <a href="#contact" className="hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
}
