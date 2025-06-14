"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import FiltersSidebar from "@/components/FiltersSidebar";
import CreateBookButton from "@/components/CreateBookButton";

interface HomePageClientProps {
  children: React.ReactNode;
  searchParams: { [key: string]: string | string[] | undefined };
}

const floatingVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.7, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

const waveVariants: Variants = {
  animate: {
    x: [0, 10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1],
    },
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function HomePageClient({
  children,
  searchParams,
}: HomePageClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const activeFiltersCount = Object.entries(searchParams).filter(
    ([key, value]) => {
      if (key === "title" || key === "page" || key === "page_size")
        return false;
      if (key === "order_direction" && value === "ASC") return false;
      if (key === "order_by" && (!value || value === "")) return false;
      return value && value.toString().trim() !== "";
    }
  ).length;

  const handleOpenFilters = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseFilters = () => {
    setIsSidebarOpen(false);
  };

  const handleClearFilters = () => {
    router.push("/");
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  return (
    <>
      <motion.div
        className="relative bg-gradient-to-br from-card via-card to-secondary/20 shadow-2xl overflow-hidden"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-3/5 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(to right, hsl(217 91% 60% / 0.05), transparent, hsl(47 96% 53% / 0.05))",
              "linear-gradient(to right, hsl(47 96% 53% / 0.05), transparent, hsl(217 91% 60% / 0.05))",
              "linear-gradient(to right, hsl(217 91% 60% / 0.05), transparent, hsl(47 96% 53% / 0.05))",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
        />

        <motion.div
          className="relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
            variants={fadeInUp}
          >
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <motion.h1
                  className="text-3xl sm:text-4xl font-bold text-primary drop-shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  Book Library
                </motion.h1>
                <motion.p
                  className="mt-2 sm:mt-3 text-base sm:text-lg text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  Explore our book collection with advanced filters
                </motion.p>
              </div>
              <motion.div
                className="flex justify-end sm:justify-start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <CreateBookButton />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <SearchBar
              onOpenFilters={handleOpenFilters}
              activeFiltersCount={activeFiltersCount}
              onClearFilters={handleClearFilters}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          variants={waveVariants}
          animate="animate"
        >
          <svg
            className="relative block w-full h-12"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="fill-background"
              animate={{
                d: [
                  "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
                  "M0,0V46.29c47.79,32.2,103.59,42.17,158,38,70.36-5.37,136.33-23.31,206.8-27.5C438.64,42.43,512.34,63.67,583,82.05c69.27,18,138.3,14.88,209.4,3.08,36.15-6,69.85-27.84,104.45-39.34C989.49,15,1113-24.29,1200,42.47V0Z",
                  "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
                ],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
              }}
            />
            <motion.path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="fill-background"
              animate={{
                d: [
                  "M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z",
                  "M0,0V25.81C13,46.92,27.64,66.86,47.69,82.05,99.41,121.27,165,121,224.58,101.58c31.15-10.15,60.09-16.07,89.67-29.8,40.92-19,84.73-36,130.83-39.67,36.26-2.85,70.9,19.42,98.6,41.56,31.77,25.39,62.32,52,103.63,63,40.44,10.79,81.35,3.31,119.13-14.28s75.16-29,116.92-33.05c59.73-5.85,113.28,32.88,168.9,48.84,30.2,8.66,59,16.17,87.09,2.5,22.43-10.89,48-16.93,60.65-39.24V0Z",
                  "M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z",
                ],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                delay: 1,
              }}
            />
            <motion.path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-background"
              animate={{
                d: [
                  "M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z",
                  "M0,0V15.63C149.93,69,314.09,81.32,475.83,52.57c43-7.64,84.23-10.12,127.61-16.46,59-8.63,112.48,22.24,165.56,45.4C827.93,87.22,886,105.24,951.2,100c86.53-7,172.46-35.71,248.8-74.81V0Z",
                  "M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z",
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                delay: 2,
              }}
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-12 right-12 w-1 h-1 bg-chart-3/30 rounded-full"
          variants={pulseVariants}
          animate="animate"
          transition={{ delay: 0.3 }}
        />
        <motion.div
          className="absolute top-8 right-20 w-1.5 h-1.5 bg-primary/15 rounded-full"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 0.7 }}
        />
        <motion.div
          className="absolute top-16 right-32 w-1 h-1 bg-chart-3/20 rounded-full"
          variants={pulseVariants}
          animate="animate"
          transition={{ delay: 1.0 }}
        />

        <motion.div
          className="absolute top-6 left-4 w-1.5 h-1.5 bg-chart-3/25 rounded-full"
          variants={pulseVariants}
          animate="animate"
          transition={{ delay: 0.5 }}
        />
        <motion.div
          className="absolute top-14 left-8 w-1 h-1 bg-primary/15 rounded-full"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 0.2 }}
        />
        <motion.div
          className="absolute top-10 left-16 w-2 h-2 bg-primary/10 rounded-full"
          variants={pulseVariants}
          animate="animate"
          transition={{ delay: 0.8 }}
        />
      </motion.div>

      <motion.div
        className="relative bg-gradient-to-b from-card via-secondary/30 to-background h-24 -mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-chart-3/5 to-transparent opacity-60" />

        <motion.div
          className="absolute top-3 left-1/4 w-1.5 h-1.5 bg-primary/20 rounded-full"
          variants={pulseVariants}
          animate="animate"
          transition={{ delay: 1.2 }}
        />
        <motion.div
          className="absolute top-6 right-1/3 w-1 h-1 bg-chart-3/25 rounded-full"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1.5 }}
        />
        <motion.div
          className="absolute top-9 left-2/3 w-2 h-2 bg-primary/15 rounded-full"
          variants={pulseVariants}
          animate="animate"
          transition={{ delay: 1.8 }}
        />
        <motion.div
          className="absolute top-12 right-1/4 w-0.5 h-0.5 bg-chart-3/20 rounded-full"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2.1 }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/80 to-transparent" />
      </motion.div>

      <div className="relative bg-background">{children}</div>

      <FiltersSidebar isOpen={isSidebarOpen} onClose={handleCloseFilters} />
    </>
  );
}
