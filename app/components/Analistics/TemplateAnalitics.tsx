'use client'

import { Box, Typography } from '@mui/material';
import { LineChart, BarChart } from '@mui/x-charts';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useTranslation } from "@/app/context/TranslationContext";

const performanceData = [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 48 },
  { month: 'Apr', value: 61 },
  { month: 'May', value: 55 },
  { month: 'Jun', value: 67 },
  { month: 'Jul', value: 72 },
];

const growthData = [
  { year: '2021', value: 30 },
  { year: '2022', value: 45 },
  { year: '2023', value: 75 },
  { year: '2024', value: 90 },
];

const MotionBox = motion(Box);

export default function TemplateAnalitics() {
  const { t } = useTranslation();
  const [perfData, setPerfData] = useState(performanceData.map(d => ({ ...d, value: 0 })));
  const [revData, setRevData] = useState(growthData.map(d => ({ ...d, value: 0 })));

  return (
    <Box sx={{ width: '100%', py: 12, px: { xs: 4, md: 8 }, backgroundColor: 'var(--secondary)' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <MotionBox 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          sx={{ mb: 8, borderLeft: '4px solid var(--primary)', pl: 4 }}
        >
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: 'Inter', 
              fontWeight: 700, 
              fontSize: { xs: '24px', md: '32px' }, 
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              lineHeight: 1.1
            }}
          >
            {t("dashboard:leads.analytics_title", "Przykładowe Analityki")}
          </Typography>
          <Typography 
            sx={{ 
              fontFamily: 'Inter', 
              fontSize: '14px', 
              color: 'var(--neutral)', 
              mt: 1,
              fontWeight: 300
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t("dashboard:leads.analytics_subtitle", "Przykładowe dane reprezentowane przez wykresy <b>Auxillium</b>") }} />
          </Typography>
        </MotionBox>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 8 }}>
          {/* Line Chart */}
          <MotionBox 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            onViewportEnter={() => setPerfData(performanceData)}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{ border: '1px solid var(--tetriary)', p: 4, transition: 'border-color 0.2s', '&:hover': { borderColor: 'var(--primary)' } }}
          >
            <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 4, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t("dashboard:leads.efficiency_trend", "Efficiency Trend")}
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <LineChart
                dataset={perfData}
                xAxis={[{ 
                  dataKey: 'month', 
                  scaleType: 'band',
                  disableLine: false,
                  disableTicks: false,
                }]}
                series={[{ 
                  dataKey: 'value', 
                  color: 'var(--primary)',
                  showMark: true,
                  area: true,
                  label: t("dashboard:leads.efficiency_label", 'Efficiency %')
                }]}
                height={300}
                margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
                sx={{
                  '.MuiAreaElement-root': {
                    fill: 'var(--primary)',
                    opacity: 0.05,
                  },
                  '.MuiLineElement-root': {
                    strokeWidth: 2,
                  },
                  '.MuiMarkElement-root': {
                    stroke: 'var(--primary)',
                    fill: 'var(--secondary)',
                    strokeWidth: 2,
                  },
                  '& .MuiChartsAxis-bottom .MuiChartsAxis-line': {
                    stroke: 'var(--primary)',
                  },
                  '& .MuiChartsAxis-left .MuiChartsAxis-line': {
                    stroke: 'var(--primary)',
                  },
                }}
              />
            </Box>
          </MotionBox>

          {/* Bar Chart */}
          <MotionBox 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            onViewportEnter={() => setRevData(growthData)}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            sx={{ border: '1px solid var(--tetriary)', p: 4, transition: 'border-color 0.2s', '&:hover': { borderColor: 'var(--primary)' } }}
          >
            <Typography variant="h3" sx={{ fontSize: '16px', fontWeight: 600, mb: 4, fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t("dashboard:leads.revenue_growth", "Revenue Growth")}
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <BarChart
                dataset={revData}
                xAxis={[{ 
                  dataKey: 'year', 
                  scaleType: 'band',
                }]}
                series={[{ 
                  dataKey: 'value', 
                  color: 'var(--primary)',
                  label: t("dashboard:leads.revenue_label", 'Revenue (k$)')
                }]}
                height={300}
                margin={{ top: 20, bottom: 30, left: 40, right: 10 }}
                sx={{
                  '.MuiBarElement-root': {
                    fill: 'var(--primary)',
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 0.8
                    }
                  },
                  '& .MuiChartsAxis-bottom .MuiChartsAxis-line': {
                    stroke: 'var(--primary)',
                  },
                  '& .MuiChartsAxis-left .MuiChartsAxis-line': {
                    stroke: 'var(--primary)',
                  },
                }}
              />
            </Box>
          </MotionBox>
        </Box>
        
        <MotionBox 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--tetriary)', pt: 4 }}
        >        
        </MotionBox>
      </Box>
    </Box>
  );
}