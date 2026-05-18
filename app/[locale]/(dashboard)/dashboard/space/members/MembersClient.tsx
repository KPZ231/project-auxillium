"use client";

import { useState } from "react";
import { inviteByEmail, generateInviteLink } from "@/actions/invitations";
import { updateMemberRole, removeMember } from "@/actions/members";
import { SpaceRole } from "@/lib/generated/client/client";
import { Trash2, Link as LinkIcon, Mail, Check, X, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  userId: string;
  role: SpaceRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

type Invitation = {
  id: string;
  invitedEmail: string | null;
  inviteToken: string;
  role: SpaceRole;
  status: string;
  expiresAt: Date;
};

export default function MembersClient({
  members,
  invitations,
  currentUserId,
  spaceId,
  canManageMembers,
  canInvite,
}: {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  spaceId: string;
  canManageMembers: boolean;
  canInvite: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SpaceRole>("USER");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInviteEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    const res = await inviteByEmail(spaceId, email, role);
    if (res?.error) {
      setError(res.error);
    } else {
      setEmail("");
      setRole("USER");
      router.refresh();
    }
    setLoading(false);
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setError(null);
    const res = await generateInviteLink(spaceId, role);
    if (res?.error) {
      setError(res.error);
    } else if (res?.link) {
      const fullLink = `${window.location.origin}${res.link}`;
      setInviteLink(fullLink);
      navigator.clipboard.writeText(fullLink);
      router.refresh();
    }
    setLoading(false);
  };

  const handleRoleChange = async (memberId: string, newRole: SpaceRole) => {
    const res = await updateMemberRole(spaceId, memberId, newRole);
    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  const handleRemove = async (memberUserId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;
    const res = await removeMember(spaceId, memberUserId);
    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {canInvite && (
        <section className="bg-white border border-zinc-200 p-6">
          <h2 className="text-h3 font-semibold text-zinc-900 mb-6">Zaproś użytkownika</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Form for email */}
            <form onSubmit={handleInviteEmail} className="flex-1 flex flex-col gap-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-caption font-medium text-zinc-500 mb-1 block uppercase tracking-wider">Adres E-mail</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Wpisz e-mail" 
                    className="w-full h-10 px-3 rounded-none border border-zinc-300 focus:outline-none focus:border-zinc-900 bg-white"
                    required
                  />
                </div>
                <div className="w-40">
                  <label className="text-caption font-medium text-zinc-500 mb-1 block uppercase tracking-wider">Rola</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as SpaceRole)}
                    className="w-full h-10 border border-zinc-300 rounded-none px-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center justify-center px-4 h-10 rounded-none bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Wyślij
                </button>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </form>

            <div className="w-px bg-zinc-200 hidden md:block"></div>

            {/* Link generation */}
            <div className="flex-1 flex flex-col justify-end gap-4">
              <button 
                type="button" 
                onClick={handleGenerateLink}
                disabled={loading}
                className="flex items-center justify-center px-4 h-10 rounded-none border border-zinc-900 text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Generuj link zaproszenia
              </button>
              {inviteLink && (
                <div className="flex items-center gap-2 p-2 border border-zinc-200 bg-zinc-50 text-sm">
                  <span className="truncate flex-1 text-zinc-600">{inviteLink}</span>
                  <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="p-1 hover:bg-zinc-200 text-zinc-500">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pending Invitations */}
      {canManageMembers && invitations.length > 0 && (
        <section>
          <h2 className="text-h3 font-semibold text-zinc-900 mb-4">Oczekujące zaproszenia</h2>
          <div className="border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
                <tr>
                  <th className="px-4 py-3">E-mail / Token</th>
                  <th className="px-4 py-3 w-32">Rola</th>
                  <th className="px-4 py-3 w-40">Wygasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invitations.map(inv => (
                  <tr key={inv.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {inv.invitedEmail ? (
                          <span className="text-zinc-900">{inv.invitedEmail}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-3 h-3 text-zinc-400" />
                            <span className="text-zinc-500 font-mono text-xs">{inv.inviteToken.split('-')[0]}...</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-700">
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Active Members */}
      <section>
        <h2 className="text-h3 font-semibold text-zinc-900 mb-4">Aktywni członkowie ({members.length})</h2>
        <div className="border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
              <tr>
                <th className="px-4 py-3">Użytkownik</th>
                <th className="px-4 py-3 w-48">Rola</th>
                <th className="px-4 py-3 w-32">Dołączył</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">
                        {member.user.name || "Brak nazwy"} {member.user.id === currentUserId && "(Ty)"}
                      </span>
                      <span className="text-zinc-500 text-xs">{member.user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {canManageMembers ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value as SpaceRole)}
                        className="h-8 border border-zinc-300 rounded-none px-2 text-sm focus:outline-none focus:border-zinc-900 bg-transparent w-full max-w-[140px]"
                      >
                        <option value="USER">User</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-100 text-zinc-700">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(canManageMembers || member.user.id === currentUserId) && (
                      <button 
                        onClick={() => handleRemove(member.user.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title={member.user.id === currentUserId ? "Opuść przestrzeń" : "Usuń członka"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
