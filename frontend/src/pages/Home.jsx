import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search, MessageSquare, Linkedin, Twitter, Github, Code, BarChart2, BrainCircuit, Cloud, Shield, GitBranch } from 'lucide-react';
import heroIllustration from '@/assets/hero-illustration.png';
import communityImage from '@/assets/community-image.png';

// Placeholder data
const teamMembers = [
  { name: "Alex Johnson", role: "Founder & CEO", avatar: "https://i.pravatar.cc/150?img=1", social: { linkedin: "#", twitter: "#", github: "#" } },
  { name: "Maria Garcia", role: "Lead Developer", avatar: "https://i.pravatar.cc/150?img=2", social: { linkedin: "#", twitter: "#", github: "#" } },
  { name: "James Smith", role: "UX/UI Designer", avatar: "https://i.pravatar.cc/150?img=3", social: { linkedin: "#", twitter: "#", github: "#" } },
  { name: "Priya Sharma", role: "Community Manager", avatar: "https://i.pravatar.cc/150?img=4", social: { linkedin: "#", twitter: "#", github: "#" } },
];

const testimonials = [
  { name: "Fatima Z.", role: "Full-Stack Developer", avatar: "https://i.pravatar.cc/150?img=8", feedback: "TechSwap helped me connect with a mentor in Casablanca who guided me through my first big project. Invaluable experience!" },
  { name: "Youssef A.", role: "Data Analyst", avatar: "https://i.pravatar.cc/150?img=9", feedback: "The platform is fantastic. I was able to learn Python for data analysis from a professional in Rabat. Highly recommended." },
  { name: "Amina K.", role: "UX/UI Designer", avatar: "https://i.pravatar.cc/150?img=10", feedback: "As a designer, I taught Figma basics to a student from Marrakech and in return, learned the fundamentals of React. A perfect swap!" },
];

const skills = [
    { name: "Web Development", icon: <Code className="w-5 h-5 mr-2" /> },
    { name: "Data Analysis", icon: <BarChart2 className="w-5 h-5 mr-2" /> },
    { name: "Machine Learning", icon: <BrainCircuit className="w-5 h-5 mr-2" /> },
    { name: "Cloud Computing", icon: <Cloud className="w-5 h-5 mr-2" /> },
    { name: "Cybersecurity", icon: <Shield className="w-5 h-5 mr-2" /> },
    { name: "Software Engineering", icon: <GitBranch className="w-5 h-5 mr-2" /> },
];


export default function Home() {
  return (
    <div className="bg-white text-gray-800">
      {/* Navigation */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="font-bold text-2xl text-blue-600">TechSwap</Link>
            <nav className="hidden md:flex gap-8 items-center">
              <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">How It Works</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-blue-50 py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-teal-500 uppercase tracking-wider mb-2">A New Way to Learn in Tech</p>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Learn New Skills, Teach What You Know
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
                TechSwap connects learners and teachers in a skill-sharing community.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
                    Start Learning
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-gray-400 text-gray-600 hover:bg-gray-100 px-8 py-6 text-lg">
                    I Have an Account
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">Trusted by 1,000+ learners worldwide.</p>
            </div>
            <div className="flex justify-center">
              <img src="https://undraw.co/illustrations/teaching-online-sessions-re-2r5i.svg" alt="Peer-to-peer learning" className="rounded-lg" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-500 text-white text-2xl font-bold rounded-full flex items-center justify-center">1</div>
                <Card className="text-center p-8 border rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transform transition-all duration-300 bg-gray-50">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserPlus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                  <p className="text-gray-600">
                    Sign up and set up your profile. Add skills you want to learn and teach.
                  </p>
                </Card>
              </div>
              {/* Step 2 */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-500 text-white text-2xl font-bold rounded-full flex items-center justify-center">2</div>
                <Card className="text-center p-8 border rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transform transition-all duration-300 bg-gray-50">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Find Your Match</h3>
                  <p className="text-gray-600">
                    Our matching algorithm will connect you with the right people.
                  </p>
                </Card>
              </div>
              {/* Step 3 */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-500 text-white text-2xl font-bold rounded-full flex items-center justify-center">3</div>
                <Card className="text-center p-8 border rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transform transition-all duration-300 bg-gray-50">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Start Swapping</h3>
                  <p className="text-gray-600">
                    Begin your skill exchange journey. Learn, teach, and grow together.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About TechSwap</h2>
              <p className="text-gray-600 text-lg mb-4">
                TechSwap is more than a platform; it's a commitment to accessible knowledge. We believe everyone has a skill to share and a desire to learn. Our mission is to create a supportive community where passion meets opportunity.
              </p>
              <p className="text-gray-600 text-lg">
                We connect learners with experienced teachers across a wide range of tech and creative fields. Whether you're looking to master a new programming language, design your first website, or simply explore new hobbies, TechSwap is your gateway to growth.
              </p>
            </div>
            <div>
              <img src={communityImage} alt="Community" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </section>

        {/* Popular Skills Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Popular Skills Being Swapped</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {skills.map(skill => (
                <Button key={skill.name} variant="outline" className="text-lg px-6 py-4 rounded-full border-gray-300 hover:bg-gray-100">
                  {skill.icon} {skill.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What Our Members Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => (
                <Card key={testimonial.name} className="bg-white p-8 rounded-lg shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600">"{testimonial.feedback}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Meet Our Team</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map(member => (
                <div key={member.name}>
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-600 mb-2">{member.role}</p>
                  <div className="flex justify-center gap-4 text-gray-500">
                    <a href={member.social.linkedin} className="hover:text-blue-600"><Linkedin /></a>
                    <a href={member.social.twitter} className="hover:text-blue-600"><Twitter /></a>
                    <a href={member.social.github} className="hover:text-blue-600"><Github /></a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="contact" className="bg-blue-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Join TechSwap today and become part of our growing community.
            </p>
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-transparent px-8 py-6 text-lg">
                Join Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <Link to="/" className="font-bold text-2xl">TechSwap</Link>
              <p className="text-gray-400 mt-2">&copy; {new Date().getFullYear()} TechSwap. All rights reserved.</p>
            </div>
            <div className="flex gap-8 mt-6 md:mt-0">
              <Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
            </div>
            <div className="flex gap-6 mt-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Github /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
