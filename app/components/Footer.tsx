'use client';

import { Github, Heart, Mail, XIcon } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'About',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Campus Partners', href: '/partners' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Safety Tips', href: '/safety' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Report an Issue', href: '/report' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Campus Reps', href: '/campus-reps' },
        { label: 'Student Blogs', href: '/blogs' },
        { label: 'Success Stories', href: '/stories' },
        { label: 'Community Guidelines', href: '/guidelines' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-indigo-600">UMP</h2>
            <p className="text-sm text-gray-600">
              The trusted marketplace for university students to buy, sell, and connect.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/ump" className="text-gray-400 hover:text-gray-500">
                <XIcon size={20} />
              </a>
              <a href="https://github.com/ump" className="text-gray-400 hover:text-gray-500">
                <Github size={20} />
              </a>
              <a href="mailto:support@ump.com" className="text-gray-400 hover:text-gray-500">
                <Mail size={20} />
              </a>
            </div>
            <a className="text-sm text-gray-600"  href="https://www.flaticon.com/free-icons/picture" title="picture icons">Picture icons created by Good Ware - Flaticon</a>
          </div>

          {/* Links sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {currentYear} UMP. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              Made with <Heart size={16} className="mx-1 text-red-500" /> for students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
