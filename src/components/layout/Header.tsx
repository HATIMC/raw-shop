import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import useCartStore from '@/hooks/useCart';
import SearchBar from '../common/SearchBar';
import CartSidebar from '../cart/CartSidebar';

export default function Header() {
  const { config } = useStoreConfig();
  const cart = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Navbar styling from config
  const navbarBgColor = config.navbarBgColor || '#ffffff';
  const navbarAlpha = config.navbarAlpha ? parseInt(config.navbarAlpha as string) / 100 : 1;
  const logoSize = config.logoSize ? parseInt(config.logoSize as string) : 40;
  const enableAnimations = config.enableAnimations !== 'false';

  return (
    <>
      <header className="shadow-sm sticky top-0 z-40" style={{ backgroundColor: navbarBgColor, opacity: navbarAlpha }}>
        {/* Top Bar */}
        <div className="bg-gray-900 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                {config.storePhone && (
                  <a href={`tel:${config.storePhone}`} className="hover:text-gray-300">
                    <span className="md:hidden">📞</span>
                    <span className="hidden md:inline">📞 {config.storePhone}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-6">
                {config.facebookUrl && (
                  <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transform hover:scale-110 transition-all" title="Facebook">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {config.instagramUrl && (
                  <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transform hover:scale-110 transition-all" title="Instagram">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {config.twitterUrl && (
                  <a href={config.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transform hover:scale-110 transition-all" title="Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {config.storeEmail && (
                  <a href={`mailto:${config.storeEmail}`} className="hover:text-gray-300 transform hover:scale-110 transition-all ml-2" title="Email">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className={`flex items-center space-x-3 ${enableAnimations ? 'hover:scale-105 transition-transform duration-300' : ''}`}>
              {config.logoPath && (
                <img 
                  src={config.logoPath} 
                  alt={config.storeName || 'Logo'} 
                  className="w-auto object-contain"
                  style={{ height: `${logoSize}px` }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
              <div 
                className="text-2xl font-bold text-primary"
                style={{ 
                  fontFamily: config.storeNameFont ? `'${config.storeNameFont}', sans-serif` : undefined,
                  fontSize: config.storeNameFontSize ? `${config.storeNameFontSize}px` : undefined
                }}
              >
                {config.storeName || 'Amazing Shop'}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`text-gray-700 hover:text-primary font-semibold transition-all relative group ${enableAnimations ? 'hover:scale-110' : ''}`}>
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/products" className={`text-gray-700 hover:text-primary font-semibold transition-all relative group ${enableAnimations ? 'hover:scale-110' : ''}`}>
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/about" className={`text-gray-700 hover:text-primary font-semibold transition-all relative group ${enableAnimations ? 'hover:scale-110' : ''}`}>
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/contact" className={`text-gray-700 hover:text-primary font-semibold transition-all relative group ${enableAnimations ? 'hover:scale-110' : ''}`}>
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/my-orders" className={`text-gray-700 hover:text-primary font-semibold transition-all relative group ${enableAnimations ? 'hover:scale-110' : ''}`}>
                My Orders
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              {config.enableSearch && (
                <div className="hidden md:block">
                  <SearchBar />
                </div>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-primary transition-all hover:scale-110 group"
              >
                <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-scale-in shadow-lg">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {config.enableSearch && (
            <div className="md:hidden mt-4">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t animate-slide-down">
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Products
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              <Link to="/my-orders" className="text-gray-700 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                My Orders
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
