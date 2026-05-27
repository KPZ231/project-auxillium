"use client";
import { useEffect, useState } from "react";
import { motion, Variants } from "motion/react";
import Link from "next/link";
import { getGeneratedDocuments } from "@/actions/templates";
import { getActiveSpaceId } from "@/actions/space";
import LoadingCircle from "@/app/components/UI/LoadingCircle";
import { useTranslation } from "@/app/context/TranslationContext";
import { FileText, ChevronRight } from "lucide-react";

export default function RecentDocumentsWidget() {
  const { t, language } = useTranslation();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const spaceId = await getActiveSpaceId();
        if (spaceId) {
          const result = await getGeneratedDocuments(spaceId);
          if (result.success && result.documents) {
            setDocuments(result.documents.slice(0, 3));
          }
        }
      } catch (err) {
        console.error("Error fetching documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white border border-gray-300 flex flex-col h-[300px] overflow-hidden"
    >
      <div className="bg-[#e5e5e5] p-6 flex justify-between items-center border-b border-gray-300 shrink-0">
        <h3 className="text-sm font-bold text-black tracking-widest uppercase flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t("dashboard:widgets.recent_documents", "Recent Documents")}
        </h3>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {loading ? (
          <div className="grow flex items-center justify-center">
            <LoadingCircle size="md" />
          </div>
        ) : documents.length === 0 ? (
          <div className="grow flex items-center justify-center text-xs font-medium text-gray-400">
            {t("dashboard:widgets.no_documents", "No recent documents")}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {documents.map((doc, idx) => (
              <Link
                key={doc.id}
                href={`/${language}/dashboard/documents/${doc.id}`}
                className="group flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-[#0A0A0A] hover:text-white transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold truncate max-w-[150px] group-hover:underline decoration-1 underline-offset-4">
                    {doc.template?.name || "Untitled"}
                  </span>
                  <span className="text-xs text-gray-500 font-mono mt-1 group-hover:text-gray-300">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto shrink-0 border-t border-gray-300">
        <Link
          href={`/${language}/dashboard/documents`}
          className="block w-full py-3 text-center text-xs font-bold tracking-widest uppercase text-black hover:bg-gray-100 transition-colors"
        >
          {t("dashboard:widgets.view_all_documents", "Document Library")}
        </Link>
      </div>
    </motion.div>
  );
}
