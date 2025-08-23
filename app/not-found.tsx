"use client"
import React from 'react';
import { Button } from '../components/ui/button';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Gift, Heart } from 'lucide-react';
import Link from 'next/link';

const NotFound: React.FC = () => {
  const router = useRouter();

  // const handleGoBack = (): void => {
    // if (typeof window !== 'undefined' && window.history.length > 1) {
      // router.back();
    // } else {
      // router.push('/');
    // }
  // };


const handleGoBack = (): void => {
  if (window.history.state && window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};

  const handleGoHome = (): void => {
    router.push('/');
  };


  return (
    <>
            <div className="relative min-h-screen bg-gradient-to-l from-[#E2E5FF] to-[#B5B8FF] flex items-center">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        


        {/* Main 404 Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Text Content */}
              <div className="text-center lg:text-left space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Gift className="w-4 h-4" />
                    <span>Oops! Page Not Found</span>
                  </div>
                  
                  <h1 className="text-6xl lg:text-8xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-blue-600 bg-clip-text text-transparent">
                    404
                  </h1>
                  
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">
                    This Gift Has Gone Missing!
                  </h2>
                  
                  <p className="text-lg md:text-xl text-black max-w-md mx-auto lg:mx-0">
                    Sorry, the page you are looking for seems to have gone somewhere else. 
                    Let us help you find perfect customers instead!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={handleGoBack}
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button
                    onClick={handleGoHome}
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-300 text-blue-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-full transition-all duration-300"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Home
                  </Button>
                  
                </div>

              </div>

              {/* Illustration */}
              <div className="relative">
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-blue-100 to-blue-100 rounded-full flex items-center justify-center relative overflow-hidden">
                    {/* Animated gift boxes */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl md:text-9xl animate-bounce">🎁</div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute top-8 left-8 text-4xl animate-pulse opacity-60">🎈</div>
                    <div className="absolute top-16 right-12 text-3xl animate-bounce delay-300 opacity-70">⭐</div>
                    <div className="absolute bottom-12 left-16 text-3xl animate-pulse delay-500 opacity-60">🎉</div>
                    <div className="absolute bottom-8 right-8 text-4xl animate-bounce delay-700 opacity-70">💝</div>
                    
                    {/* Decorative rings */}
                    <div className="absolute inset-4 border-2 border-purple-200 rounded-full opacity-30"></div>
                    <div className="absolute inset-8 border-2 border-pink-200 rounded-full opacity-40"></div>
                  </div>
                </div>
                
                {/* Background decorative elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 -left-8 w-16 h-16 bg-green-200 rounded-full opacity-25 animate-bounce delay-2000"></div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-16 text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-100">
                <div className="flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">Need Help Finding Something?</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Our gift experts are here to help you find the perfect present for any occasion.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                    >
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/faq">
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>  
    </>
  );
};

export default NotFound;
