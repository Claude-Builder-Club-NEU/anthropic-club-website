import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import LoadingScreen from "../components/LoadingScreen";
import { INTEREST_FORM } from "../lib/links";

const Home = () => {
  const hasShownLoading = sessionStorage.getItem('hasShownLoading');
  const [isLoading, setIsLoading] = useState(!hasShownLoading);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('hasShownLoading', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const benefits = [
    {
      icon: "🎓",
      title: "Access to Anthropic workshops and lectures",
      description:
        "Learn directly from industry experts and cutting-edge research",
    },
    {
      icon: "💥",
      title: "Connect with passionate students",
      description:
        "Join a community of like-minded AI enthusiasts and builders",
    },
    {
      icon: "🏆",
      title: "Exclusive hackathons and prizes",
      // TODO: Jackson — previous copy claimed "$18,000 in prizes this fall".
      // Unverified figure with a stale date; removed pending confirmation.
      description: "Build and compete alongside other students",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-charcoal/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  const AnimatedLine = ({ d, delay = 0, duration = 2 }) => {
    const pathLength = useMotionValue(0);

    return (
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        className="text-charcoal/30"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration, delay, ease: "easeInOut" },
          opacity: { duration: 0.5, delay },
        }}
        style={{ pathLength }}
      />
    );
  };

  const MorphingShape = ({ className, delay = 0 }) => {
    const morphVariants = {
      initial: {
        d: "M50,0 L100,25 L100,75 L50,100 L0,75 L0,25 Z",
        rotate: 0,
      },
      morph1: {
        d: "M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z",
        rotate: 45,
      },
      morph2: {
        d: "M50,20 L80,35 L80,65 L50,80 L20,65 L20,35 Z",
        rotate: 90,
      },
      morph3: {
        d: "M50,0 L100,25 L100,75 L50,100 L0,75 L0,25 Z",
        rotate: 135,
      },
    };

    return (
      <motion.svg
        className={className}
        viewBox="0 0 100 100"
        animate={["initial", "morph1", "morph2", "morph3"]}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        variants={morphVariants}
      >
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-charcoal/20"
          variants={morphVariants}
        />
      </motion.svg>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden" ref={containerRef}>
      <Particles />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MorphingShape
          className="absolute top-20 right-20 w-24 h-24"
          delay={0}
        />
        <MorphingShape
          className="absolute bottom-40 left-20 w-32 h-32"
          delay={2}
        />
        <MorphingShape
          className="absolute top-1/2 left-1/2 w-20 h-20"
          delay={4}
        />
      </div>

      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      <motion.section
        key="hero-section"
        className="relative bg-gradient-to-br from-coral to-coral/80 text-white py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          background: useTransform(
            scrollYProgress,
            [0, 0.3],
            [
              "linear-gradient(135deg, #E17B5A 0%, rgba(225, 123, 90, 0.8) 100%)",
              "linear-gradient(135deg, #D16A4A 0%, rgba(209, 106, 74, 0.8) 100%)",
            ]
          ),
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute top-10 right-10 w-32 h-32"
            viewBox="0 0 100 100"
          >
            <AnimatedLine
              d="M20,20 L80,20 L80,80 L20,80 Z"
              delay={1}
              duration={2}
            />
            <AnimatedLine
              d="M30,30 L70,30 L70,70 L30,70 Z"
              delay={1.5}
              duration={2}
            />
          </svg>

          <svg
            className="absolute bottom-20 left-10 w-24 h-24"
            viewBox="0 0 100 100"
          >
            <AnimatedLine
              d="M50,10 L90,50 L50,90 L10,50 Z"
              delay={2}
              duration={2}
            />
          </svg>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full"
            animate={{
              y: [0, 15, 0],
              scale: [1, 0.9, 1],
              rotate: [0, -90, -180],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
              times: [0, 0.5, 1],
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
              rotate: [0, 270, 180],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
              times: [0, 0.5, 1],
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {"Join the Claude Builder Club".split("").map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + index * 0.03,
                  ease: "easeOut",
                }}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            Everyone can build with AI. Learn, connect, and grow together at
            Northeastern University.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={INTEREST_FORM} target="_blank" rel="noopener noreferrer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-coral hover:bg-neutral-light hover:text-coral"
                >
                  Join the Club
                </Button>
              </motion.div>
            </a>
            <Link to="/about">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-coral"
                >
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        key="benefits-section"
        className="py-20 bg-neutral-light relative"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, threshold: 0.1 }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal/30 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
              Why Join the Club?
            </h2>
            <p className="text-lg text-neutral-dark max-w-2xl mx-auto mb-12">
              Discover the amazing benefits of being part of the Anthropic Club
              community
            </p>
          </motion.div>

          {/*
            REMOVED 2026-08-13 — "FREE Claude Pro + $25 API Credits" benefit panel.
            These are unverified membership claims for the current semester and must not
            be republished until confirmed accurate. See PRODUCT.md → Evidence on Hand.
            Original markup is in git history on branch rebuild/phase-0-setup's parent.
          */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  scale: 1.02,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card
                  className="text-center h-full group rounded-2xl"
                  accentSweep
                  colorGlow
                  hover
                >
                  <motion.div
                    className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center mx-auto mb-6"
                    transition={{ duration: 0.3 }}
                  >
                    <motion.span
                      className="text-2xl"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {benefit.icon}
                    </motion.span>
                  </motion.div>
                  <h3 className="text-xl font-semibold text-charcoal mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-dark leading-relaxed">
                    {benefit.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        key="cta-section"
        className="py-20 bg-white relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, threshold: 0.1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal/20 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-charcoal mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {"Ready to Start Your AI Journey?"
              .split("")
              .map((letter, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.02,
                    ease: "easeOut",
                  }}
                  className="inline-block"
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
          </motion.h2>
          <p className="text-lg text-neutral-dark mb-8">
            Tell us you&apos;re interested and we&apos;ll be in touch about
            what&apos;s coming up.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href={INTEREST_FORM} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="text-lg px-8 py-4">
                Get Started Today
              </Button>
            </a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;