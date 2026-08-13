import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import LoadingScreen from "../components/LoadingScreen";
import Hero from "../components/Hero";
import { INTEREST_FORM } from "../lib/links";

const Home = () => {
  const hasShownLoading = sessionStorage.getItem('hasShownLoading');
  const [isLoading, setIsLoading] = useState(!hasShownLoading);

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      <Hero />

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