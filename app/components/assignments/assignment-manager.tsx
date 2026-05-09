"use client";

import { useState } from "react";
import { MemberBadge } from "./member-badge";
import { MemberSelector } from "./member-selector";
import { assignEmployeeToProject, unassignEmployeeFromProject, assignEmployeeToClient, unassignEmployeeFromClient } from "@/actions/assignment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AssignmentManagerProps {
  entityId: string;
  entityType: "project" | "task" | "client";
  initialMembers: any[];
  title?: string;
}

export function AssignmentManager({ 
  entityId, 
  entityType, 
  initialMembers,
  title = "Assigned Team"
}: AssignmentManagerProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleAssign = async (employeeId: string) => {
    setIsProcessing(true);
    try {
      let result;
      if (entityType === "project") {
        result = await assignEmployeeToProject(entityId, employeeId);
      } else if (entityType === "client") {
        result = await assignEmployeeToClient(entityId, employeeId);
      } else {
        toast.error("Task assignments not implemented yet");
        return;
      }

      if (result.success) {
        toast.success("Team member assigned");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to assign");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnassign = async (employeeId: string) => {
    setIsProcessing(true);
    try {
      let result;
      if (entityType === "project") {
        result = await unassignEmployeeFromProject(entityId, employeeId);
      } else if (entityType === "client") {
        result = await unassignEmployeeFromClient(entityId, employeeId);
      } else {
        toast.error("Task assignments not implemented yet");
        return;
      }

      if (result.success) {
        toast.success("Team member removed");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const assignedIds = initialMembers.map((m) => m.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#71717A]">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => setIsSelectorOpen(true)}
          className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wider hover:underline"
        >
          + Assign Member
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {initialMembers.length === 0 ? (
          <p className="text-[13px] text-[#71717A] italic">No team members assigned.</p>
        ) : (
          initialMembers.map((member) => (
            <MemberBadge
              key={member.id}
              name={member.name}
              role={member.role}
              showRemove={true}
              onRemove={() => handleUnassign(member.id)}
            />
          ))
        )}
      </div>

      <MemberSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleAssign}
        assignedIds={assignedIds}
      />
      
      {isProcessing && (
        <div className="fixed inset-0 z-70 bg-white/20 backdrop-blur-[1px] flex items-center justify-center cursor-wait" />
      )}
    </div>
  );
}
