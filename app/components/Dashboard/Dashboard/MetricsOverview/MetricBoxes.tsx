"use client";
import { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import { TrendingUp, Layers, Target } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

interface MetricData {
  id: string;
  title: string;
  value: string;
  badgeText: string;
  badgeType: "dark" | "outline";
  subText: string;
  icon: "trending" | "layers" | "target";
  chartData?: any[];
}

const mockData: MetricData[] = [
  {
    id: "revenue",
    title: "GROSS REVENUE",
    value: "$4.2M",
    badgeText: "+12.4%",
    badgeType: "dark",
    subText: "vs last quarter",
    icon: "trending",
    chartData: [
      { value: 100 },
      { value: 150 },
      { value: 120 },
      { value: 200 },
      { value: 250 },
      { value: 220 },
      { value: 300 },
    ],
  },
  {
    id: "projects",
    title: "ACTIVE PROJECTS",
    value: "24",
    badgeText: "3 Pending",
    badgeType: "outline",
    subText: "deployment phase",
    icon: "layers",
  },
  {
    id: "leads",
    title: "NEW LEADS",
    value: "186",
    badgeText: "+42",
    badgeType: "dark",
    subText: "from AI campaigns",
    icon: "target",
  },
];

export default function MetricBoxes() {
  const [data, setData] = useState<MetricData[]>(mockData);

  // ==========================================
  // KOD DO ZACIĄGANIA DANYCH Z BAZY (ZAKOMENTOWANY)
  // ==========================================
  // useEffect(() => {
  //   const fetchMetricsFromDB = async () => {
  //     try {
  //       // Tutaj endpoint Twojego API połączony z bazą danych (np. Prisma)
  //       const response = await fetch('/api/dashboard/metrics');
  //       if (response.ok) {
  //         const dbData = await response.json();
  //         setData(dbData);
  //       }
  //     } catch (error) {
  //       console.error("Błąd pobierania danych z bazy:", error);
  //     }
  //   };
  //   fetchMetricsFromDB();
  // }, []);

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // custom ease-out
      },
    },
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "trending":
        return <TrendingUp className="w-5 h-5 text-black" strokeWidth={2.5} />;
      case "layers":
        return <Layers className="w-5 h-5 text-black" strokeWidth={2.5} />;
      case "target":
        return <Target className="w-5 h-5 text-black" strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full px-8 py-4 mb-12">
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {data.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="w-full bg-white border border-gray-300 p-6 flex flex-col justify-between h-[300px] relative overflow-hidden"
          >
            {/* Top row */}
            <div className="flex justify-between items-start z-10">
              <h3 className="text-xs font-semibold text-gray-400 tracking-widest uppercase w-1/2">
                {item.title}
              </h3>
              {getIcon(item.icon)}
            </div>

            {/* Middle row */}
            <div className="grow flex items-center relative z-10 mt-4">
              <h2 className="text-[5rem] leading-none font-extrabold text-black tracking-tighter">
                {item.value}
              </h2>
            </div>

            {/* Recharts background sparkline for Gross Revenue (optional nice touch) */}
            {item.chartData && (
              <div className="absolute inset-0 top-1/3 opacity-15 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#000"
                      strokeWidth={10}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bottom row */}
            <div className="flex items-center gap-3 z-10">
              <span
                className={`text-xs font-bold px-2 py-1 ${
                  item.badgeType === "dark"
                    ? "bg-black text-white"
                    : "border border-gray-400 bg-gray-100 text-black"
                }`}
              >
                {item.badgeText}
              </span>
              <span className="text-xs text-gray-400 font-medium leading-tight max-w-[80px]">
                {item.subText}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}