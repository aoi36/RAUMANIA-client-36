"use client"
import Link from "next/link";
import React, { useState } from "react";
import { ButtonLink } from "./ButtonLink";
import { Logo } from "./Logo";
import { FaX } from "react-icons/fa6";
import { CgMenu } from "react-icons/cg";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="header absolute left-0 right-0 top-0 z-50 ~h-32/48 ~px-4/6 ~py-4/6 hd:h-32">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto,auto] items-center gap-6 md:grid-cols-[1fr,auto,1fr]">
        <Link href="/" className="justify-self-start">
          <Logo className="text-brand-pink ~h-16/24" />
        </Link>

        {/* Mobile menu button */}
        <button 
          className="z-50 md:hidden justify-self-end" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <FaX className="~w-6/8 ~h-6/8" />
          ) : (
            <CgMenu className="~w-6/8 ~h-6/8" />
          )}
        </button>

        {/* Mobile navigation */}
        <div className={`fixed inset-0 bg-brand-gray bg-opacity-95 z-40 flex items-center justify-center transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col items-center justify-center ~gap-6/10 ~text-xl/3xl">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="~text-lg/xl hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4">
                <ButtonLink 
                  href="/cart" 
                  icon="cart" 
                  color="purple" 
                  aria-label="Cart (1)"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart (1)
                </ButtonLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* Desktop navigation */}
      

        <div className="justify-self-end hidden md:block">
          <ButtonLink href="/cart" icon="cart" color="purple" aria-label="Cart (1)">
            <span className="md:hidden">1</span>
            <span className="hidden md:inline">Cart (1)</span>
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
