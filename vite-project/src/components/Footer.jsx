import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaGithub,
  FaYoutube,
} from "react-icons/fa6";
import { EXTERNAL_LINKS } from "../config/links";

const socialLinks = [
  { label: "Facebook", icon: FaFacebookF, url: EXTERNAL_LINKS.facebook },
  { label: "Instagram", icon: FaInstagram, url: EXTERNAL_LINKS.instagram },
  { label: "X", icon: FaXTwitter, url: EXTERNAL_LINKS.twitter },
  { label: "GitHub", icon: FaGithub, url: EXTERNAL_LINKS.github },
  { label: "YouTube", icon: FaYoutube, url: EXTERNAL_LINKS.youtube },
];

const footerLinks = [
  {
    title: "Solutions",
    links: [
      { name: "Residential Finishing", href: "#services" },
      { name: "Commercial Finishing", href: "#services" },
      { name: "Office Finishing", href: "#services" },
      { name: "Interior Design", href: "#services" },
      { name: "Renovation & Remodeling", href: "#services" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "#get-started" },
      { name: "FAQ", href: "#about" },
      { name: "Request a Quote", href: "#get-started" },
      { name: "Help Center", href: "#about" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#about" },
      { name: "Blog", href: "#about" },
      { name: "Jobs", href: "#about" },
      { name: "Press", href: "#about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms of service", href: "#about" },
      { name: "Privacy policy", href: "#about" },
      { name: "License", href: "#about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="scroll-mt-16 bg-[#0f172a] text-white">
      <div className="mx-auto max-w-7xl px-8 py-16 lg:px-12">
        <div className="flex flex-col gap-8">
          <div>
            <p className="max-w-2xl text-lg text-slate-400">
              Making the world a better place through constructing elegant, high-quality finishing solutions.
            </p>
          </div>

          <div className="flex items-center gap-7">
            {socialLinks.map(({ label, icon: Icon, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition hover:border-cyan-400 hover:text-cyan-400 hover:scale-105"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="mb-7 text-lg font-semibold text-white">{section.title}</h3>

              <ul className="space-y-4">
                {section.links.map((linkItem) => (
                  <li key={linkItem.name}>
                    <a
                      href={linkItem.href}
                      className="text-base text-slate-400 transition duration-200 hover:text-cyan-400"
                    >
                      {linkItem.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-24 border-t border-slate-800 pt-8 flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-slate-500">
            © 2026 Local Works Finishing Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}