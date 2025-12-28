import { Link } from 'react-router-dom';
import { useStoreConfig } from '@/hooks/useStoreConfig';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';

export default function HomePage() {
  const { config } = useStoreConfig();
  const { getFeaturedProducts, loading } = useProducts();
  const featuredProducts = getFeaturedProducts(8);

  return (
    <div>
      {/* Hero Banner with Enhanced Design */}
      <section
        className="relative bg-cover bg-center h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: config.bannerImage
            ? `url(${config.bannerImage})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight animate-slide-in-left">
            {config.bannerTitle || 'Welcome to Our Store'}
          </h1>
          <p className="text-lg md:text-2xl mb-10 text-gray-200 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            {config.bannerSubtitle || 'Discover Amazing Products'}
          </p>
          <Link
            to={config.bannerCtaLink || '/products'}
            className="inline-block bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-primary hover:text-white transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-primary/50 animate-scale-in"
            style={{ animationDelay: '0.4s' }}
          >
            {config.bannerCtaText || 'Shop Now'} →
          </Link>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Products with Enhanced Design */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Collection</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 mt-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Featured Products</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Check out our hand-picked selection of amazing products just for you</p>
          </div>
          <ProductGrid products={featuredProducts} loading={loading} />
          <div className="text-center mt-12 animate-fade-in">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 btn btn-primary px-10 py-4 text-lg rounded-full hover:scale-105 hover:shadow-2xl transition-all duration-300 group"
            >
              <span>View All Products</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter with Modern Design */}
      {config.enableNewsletter && (
        <section className="py-20 bg-gradient-to-r from-primary via-blue-600 to-secondary text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="text-5xl mb-6">📬</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Stay Updated</h2>
              <p className="text-xl mb-10 text-blue-100">
                {config.newsletterText || 'Subscribe for exclusive deals and latest updates!'}
              </p>
              <form className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl"
                  />
                  <button
                    type="submit"
                    className="bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
