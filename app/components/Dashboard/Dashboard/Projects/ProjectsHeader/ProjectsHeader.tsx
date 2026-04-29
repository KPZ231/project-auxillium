"use client";
import { motion, Variants } from "motion/react";
import Button from "@/app/components/Button/Button";
import { toast } from "sonner";
import { ListFilter, Plus } from "lucide-react";

export default function ProjectsHeader() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const FilterButton = () => {
    return toast.success("Uporządkowano dane, test");
  };

  return (
    <>
      <section className="w-full">
        <motion.div
          className="flex flex-row justify-between items-center py-6 px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Left Side: Text */}
          <motion.div className="flex flex-col gap-1" variants={itemVariants}>
            <h2 className="text-4xl font-black text-black tracking-tight">
              Active Portfolios
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Managing 12 ongoing architectural and design initiatives.
            </p>
          </motion.div>

          {/* Right Side: Buttons */}
          <motion.div
            className="flex flex-row items-center gap-4"
            variants={itemVariants}
          >
            <Button
              onClick={FilterButton}
              content="FILTER"
              url=""
              variant="secondary"
              icon={<ListFilter className="w-4 h-4" strokeWidth={2.5} />}
            />
            <Button
              content="NEW PROJECT"
              url="/dashboard/projects/new"
              variant="primary"
              icon={<Plus className="w-4 h-4" strokeWidth={2.5} />}
            />
          </motion.div>
        </motion.div>

        <hr className="border-gray-200" />
      </section>
    </>
  );
}
