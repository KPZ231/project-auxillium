import { getClients } from "@/actions/clients";
import PageHeader from "@/app/components/Dashboard/Dashboard/Shared/PageHeader/PageHeader";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex flex-col w-full">
      <PageHeader 
        title="Client Roster" 
        subtitle={`Managing ${clients.length} active client relationships.`}
        primaryAction={{
          label: "NEW CLIENT",
          href: "/dashboard/clients/new",
          icon: <Plus className="w-4 h-4" strokeWidth={2.5} />
        }}
      />
      
      <div className="p-8">
        {clients.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#D4D4D8]">
            <p className="text-[14px] text-[#71717A] uppercase tracking-widest">No clients found. Initialize your first client.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((client: any) => (
              <Link href={`/dashboard/clients/${client.id}`} key={client.id} className="group block bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-colors relative overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {client.photoUrl ? (
                      <div className="w-12 h-12 relative flex-shrink-0 bg-[#F4F4F5]">
                        <Image src={client.photoUrl} alt={client.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-[#0A0A0A] text-white font-bold text-[18px]">
                        {client.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-[16px] font-bold text-[#0A0A0A] uppercase tracking-tight group-hover:underline">{client.name}</h3>
                      <p className="text-[12px] text-[#71717A] mt-1">{client.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-[#E5E5E5] flex justify-between text-[11px] uppercase tracking-widest text-[#71717A] font-bold">
                    <span>{client.projects?.length || 0} Projects</span>
                    <span className="text-[#0A0A0A] group-hover:translate-x-1 transition-transform">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
