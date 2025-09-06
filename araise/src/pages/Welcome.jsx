import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, Dumbbell, Droplet, Utensils, TrendingUp, Users, Award } from 'lucide-react'
import { EtheralShadow } from '../components/ui/etheral-shadow'

export default function Welcome() {
  const features = [
    {
      icon: Dumbbell,
      title: "Smart Workouts",
      description: "AI-powered workout plans tailored to your fitness level and goals"
    },
    {
      icon: Droplet,
      title: "Water Tracking",
      description: "Stay hydrated with intelligent reminders and progress tracking"
    },
    {
      icon: Utensils,
      title: "Nutrition Planning",
      description: "Track meals and calories with our comprehensive food database"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed insights and statistics to monitor your transformation"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with like-minded fitness enthusiasts on your journey"
    },
    {
      icon: Award,
      title: "Achievements",
      description: "Unlock badges and level up as you reach your fitness milestones"
    }
  ]

  return (
    <div className="min-h-screen">
      <style jsx>{`
        @keyframes liquidWave {
          0% { 
            background-position: 0% 0%;
            filter: drop-shadow(0 0 15px rgba(192, 192, 192, 0.8)) brightness(1);
          }
          25% { 
            background-position: 50% 100%;
            filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.9)) brightness(1.3);
          }
          50% { 
            background-position: 100% 0%;
            filter: drop-shadow(0 0 30px rgba(220, 220, 220, 1)) brightness(1.5);
          }
          75% { 
            background-position: 50% 100%;
            filter: drop-shadow(0 0 20px rgba(169, 169, 169, 0.8)) brightness(1.1);
          }
          100% { 
            background-position: 0% 0%;
            filter: drop-shadow(0 0 15px rgba(192, 192, 192, 0.8)) brightness(1);
          }
        }
        
        @keyframes liquidWaveReverse {
          0% { 
            background-position: 100% 100%;
            filter: drop-shadow(0 0 20px rgba(128, 128, 128, 0.9)) brightness(1.2);
          }
          25% { 
            background-position: 0% 50%;
            filter: drop-shadow(0 0 35px rgba(255, 255, 255, 1)) brightness(1.6);
          }
          50% { 
            background-position: 100% 0%;
            filter: drop-shadow(0 0 40px rgba(211, 211, 211, 1.1)) brightness(1.8);
          }
          75% { 
            background-position: 0% 50%;
            filter: drop-shadow(0 0 25px rgba(160, 160, 160, 0.9)) brightness(1.3);
          }
          100% { 
            background-position: 100% 100%;
            filter: drop-shadow(0 0 20px rgba(128, 128, 128, 0.9)) brightness(1.2);
          }
        }
        
        .liquid-text {
          background: linear-gradient(
            135deg,
            #1a1a1a 0%,
            #2d2d2d 8%,
            #4a4a4a 16%,
            #6d6d6d 24%,
            #9a9a9a 32%,
            #c8c8c8 40%,
            #e8e8e8 48%,
            #a8a8a8 56%,
            #7a7a7a 64%,
            #4d4d4d 72%,
            #2a2a2a 80%,
            #1a1a1a 88%,
            #0a0a0a 96%,
            #1a1a1a 100%
          );
          background-size: 200% 200%;
          animation: liquidWave 4s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.1);
          filter: contrast(1.5) saturate(0.8);
        }
        
        .liquid-text-reverse {
          background: linear-gradient(
            225deg,
            #0f0f0f 0%,
            #252525 6%,
            #404040 12%,
            #606060 18%,
            #858585 24%,
            #b0b0b0 30%,
            #d5d5d5 36%,
            #f0f0f0 42%,
            #d0d0d0 48%,
            #a0a0a0 54%,
            #707070 60%,
            #454545 66%,
            #252525 72%,
            #0f0f0f 78%,
            #050505 84%,
            #0f0f0f 90%,
            #1f1f1f 96%,
            #0f0f0f 100%
          );
          background-size: 250% 250%;
          animation: liquidWaveReverse 5s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.1);
          filter: contrast(1.6) saturate(0.7);
        }
      `}</style>
      {/* Hero Section with Ethereal Background */}
      <EtheralShadow
        color="rgba(128, 128, 128, 0.6)" // Neutral gray instead of blue
        animation={{ scale: 80, speed: 60 }}
        noise={{ opacity: 0.2, scale: 1.5 }}
        sizing="fill"
        className="min-h-screen relative"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Flame size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
            </div>
            <span className="font-hurion font-bold text-2xl text-white tracking-tight">
              Araise
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link
              to="/login"
              className="text-gray-400 hover:text-white transition-colors font-medium text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:bg-gray-100"
            >
              Get Started
            </Link>
          </motion.div>
        </header>

        {/* Hero Content */}
        <div className="flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-hurion font-bold mb-8 tracking-tight leading-[1.1] relative">
                <span className="liquid-text block mb-2">
                  Don't Just Train.
                </span>
                <span className="liquid-text-reverse block italic">
                  Transform.
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-inter font-light leading-relaxed tracking-wide">
                Your journey isn't just about fitness — it's about transformation. Build consistency, conquer your goals, and rise beyond who you were yesterday.
              </p>
              
              <div className="mb-8">
                <p className="text-sm md:text-base text-gray-400 font-inter font-medium tracking-[0.15em] uppercase">
                  Rise Above Mediocrity. Beyond the Old Self.
                </p>
                <p className="text-lg md:text-xl text-white font-hurion font-semibold mt-2 tracking-wide">
                  Araise Toward Greatness.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="bg-white text-black px-10 py-4 rounded-none font-inter font-medium text-sm tracking-wide transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02] border border-transparent hover:shadow-lg uppercase"
              >
                Begin Transformation
              </Link>
              <Link
                to="/login"
                className="border border-gray-500 text-white px-10 py-4 rounded-none font-inter font-medium text-sm tracking-wide transition-all duration-300 hover:bg-white/5 hover:border-gray-300 uppercase"
              >
                Continue Journey
              </Link>
            </motion.div>
          </div>
        </div>
      </EtheralShadow>

      {/* Features Section */}
      <section className="bg-black px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-hurion font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-inter font-light">
              Comprehensive tools and features designed to support every aspect of your fitness journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-hurion font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 font-inter font-light">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-800">
              <h2 className="text-4xl font-hurion font-bold text-white mb-4">
                Ready to Transform Your Life?
              </h2>
              <p className="text-xl text-gray-400 mb-8 font-inter font-light">
                Join thousands of users who have already started their fitness transformation with Araise.
              </p>
              <Link
                to="/signup"
                className="inline-block bg-white text-black px-10 py-4 rounded-none font-inter font-medium text-sm tracking-wide transition-all duration-300 hover:bg-gray-100 hover:scale-[1.02] border border-transparent hover:shadow-lg uppercase"
              >
                Start Your Journey Today
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-6 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-hurion font-bold text-xl text-white tracking-tight">
              Araise
            </span>
          </div>
          <p className="text-gray-500 font-inter text-sm tracking-wide">
            © 2025 Araise. Rise Above. Transform Beyond.
          </p>
        </div>
      </footer>
    </div>
  )
}
