import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative mt-20 border-t-2 border-orange-400 bg-linear-to-b from-orange-200/85 via-amber-100/80 to-orange-100/80 " style={{
            borderRadius:"4rem 4rem 0 0",
        }}>
            <div className="container-custom py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">Atom</h3>
                        <p className="text-gray-600 text-sm">
                            Empowering learners worldwide with AI-powered education and expert-led courses.
                        </p>
                        <div className="flex items-center space-x-3">
                            <a href="/contact" className="w-10 h-10 rounded-xl bg-orange-300 text-orange-900 hover:bg-orange-400 flex items-center justify-center transition-all shadow-sm">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="/contact" className="w-10 h-10 rounded-xl bg-orange-300 text-orange-900 hover:bg-orange-400 flex items-center justify-center transition-all shadow-sm">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="/contact" className="w-10 h-10 rounded-xl bg-orange-300 text-orange-900 hover:bg-orange-400 flex items-center justify-center transition-all shadow-sm">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="/contact" className="w-10 h-10 rounded-xl bg-orange-300 text-orange-900 hover:bg-orange-400 flex items-center justify-center transition-all shadow-sm">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Browse Courses</a></li>
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Become a Teacher</a></li>
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Pricing</a></li>
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">About Us</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Help Center</a></li>
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-orange-700 transition-colors font-medium">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-orange-300 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <p className="text-gray-600 text-sm">
                        © {new Date().getFullYear} Atom. All rights reserved.
                    </p>
                    <p className="text-gray-600 text-sm flex items-center space-x-1">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-error fill-current" />
                        <span>for learners worldwide</span>
                    </p>
                </div>
            </div>        
        </footer>
    );
};

export default Footer;
