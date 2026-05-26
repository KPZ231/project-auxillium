"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminUsers, deleteUserByAdmin, updateUserByAdmin, purgeAllDataByAdmin } from "@/actions/admin-users";
import { adminLogoutAction } from "@/actions/admin-auth";

export default function AdminDashboardClient({ initialUsers, initialTotal, initialPages }: any) {
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [purgeText, setPurgeText] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const [purgeError, setPurgeError] = useState("");
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { users: newUsers } = await getAdminUsers(page, 20, search);
      setUsers(newUsers);
    } catch (e) {
      router.push("/admin/login");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserByAdmin(id);
        fetchUsers();
      } catch (e: any) {
        alert("Failed to delete user: " + (e?.message ?? "Unknown error"));
      }
    }
  };

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPurging(true);
    setPurgeError("");

    const res = await purgeAllDataByAdmin(purgeText);
    if (res.error) {
      setPurgeError(res.error);
      setIsPurging(false);
    } else {
      alert("All data has been purged successfully.");
      setShowPurgeDialog(false);
      setIsPurging(false);
      setPurgeText("");
      fetchUsers();
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    try {
      let planData: any = {};
      if (editingUser.plan === "FREE") {
        planData = { stripePriceId: null, stripeSubscriptionId: null, stripeCurrentPeriodEnd: null };
      } else if (editingUser.plan === "PRO") {
        planData = { stripePriceId: "price_1Taey5EBFAZLdzO9LlYWpLIj", stripeCurrentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) };
      } else if (editingUser.plan === "ENTERPRISE") {
        planData = { stripePriceId: "price_1Taey4EBFAZLdzO9Rkn8Jy6Z", stripeCurrentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) };
      }

      const res = await updateUserByAdmin(editingUser.id, {
        name: editingUser.name,
        username: editingUser.username,
        email: editingUser.email,
        ...planData
      });

      if (res.success) {
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e: any) {
      alert("Failed to update user: " + (e?.message ?? "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminLogoutAction();
    router.push("/admin/login");
  };

  return (
    <div className="p-16 max-w-7xl mx-auto bg-[#FAFAFA] min-h-screen text-[#0A0A0A] font-inter">
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-[40px] font-bold leading-[1.1]">System Administration</h1>
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-transparent text-[#0A0A0A] border border-[#0A0A0A] text-sm hover:bg-[#0A0A0A] hover:text-[#FAFAFA] transition-none rounded-none"
        >
          Logout
        </button>
      </div>

      <div className="mb-12">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by email, username or name..."
            className="flex-1 h-12 px-4 bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 rounded-none text-sm"
          />
          <button 
            type="submit"
            className="h-12 px-8 bg-[#0A0A0A] text-[#FAFAFA] text-sm font-medium hover:bg-transparent hover:text-[#0A0A0A] hover:border hover:border-[#0A0A0A] transition-none rounded-none"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#E5E5E5] mb-16">
        {(users ?? []).map((user: any) => (
          <div key={user.id} className="flex items-center justify-between p-4 border-b border-[#F4F4F5] hover:bg-[#F4F4F5]">
            <div>
              <p className="text-sm font-semibold">{user.name || "No Name"} <span className="text-[#71717A] font-normal ml-2">{user.email}</span></p>
              <p className="text-xs text-[#71717A] mt-1">ID: {user.id} • Auth: {user.authProvider} • Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  let currentPlan = "FREE";
                  if (user.stripePriceId === "price_1Taey5EBFAZLdzO9LlYWpLIj") currentPlan = "PRO";
                  if (user.stripePriceId === "price_1Taey4EBFAZLdzO9Rkn8Jy6Z") currentPlan = "ENTERPRISE";
                  setEditingUser({ ...user, plan: currentPlan });
                }}
                className="px-4 py-2 bg-transparent text-[#0A0A0A] border border-[#0A0A0A] text-sm hover:bg-[#0A0A0A] hover:text-[#FAFAFA] rounded-none transition-none"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(user.id)}
                className="px-4 py-2 bg-[#DC2626] text-[#FAFAFA] text-sm hover:opacity-80 rounded-none transition-none"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {(users ?? []).length === 0 && !loading && (
          <div className="p-8 text-center text-[#71717A] text-sm">No users found.</div>
        )}
      </div>

      <div className="pt-16 border-t border-[#D4D4D8]">
        <h2 className="text-[28px] font-semibold mb-4 text-[#DC2626]">Danger Zone</h2>
        <p className="text-sm text-[#71717A] mb-8 max-w-2xl">
          Purging all data will permanently delete all projects, clients, leads, financial records, tasks, and users from the database. This action cannot be undone.
        </p>
        
        {!showPurgeDialog ? (
          <button 
            onClick={() => setShowPurgeDialog(true)}
            className="px-8 py-3 bg-[#DC2626] text-[#FAFAFA] text-sm font-bold hover:opacity-80 rounded-none transition-none"
          >
            Purge All Data
          </button>
        ) : (
          <div className="bg-white border border-[#DC2626] p-8 max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[#DC2626]">Are you absolutely sure?</h3>
            <p className="text-sm mb-6">Type <strong>PURGE ALL DATA</strong> to confirm.</p>
            {purgeError && <p className="text-[#DC2626] text-sm mb-4">{purgeError}</p>}
            
            <form onSubmit={handlePurge} className="space-y-4">
              <input
                type="text"
                value={purgeText}
                onChange={(e) => setPurgeText(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 rounded-none text-sm"
                required
              />
              <div className="flex gap-4">
                <button 
                  type="submit"
                  disabled={isPurging || purgeText !== "PURGE ALL DATA"}
                  className="flex-1 h-10 bg-[#DC2626] text-[#FAFAFA] text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed rounded-none transition-none"
                >
                  {isPurging ? "Purging..." : "Confirm Purge"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPurgeDialog(false)}
                  className="flex-1 h-10 bg-transparent text-[#0A0A0A] border border-[#0A0A0A] text-sm hover:bg-[#F4F4F5] rounded-none transition-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E5E5E5] p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-[#0A0A0A]">Edit User</h2>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#0A0A0A]">Name</label>
                <input
                  type="text"
                  value={editingUser.name || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 rounded-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#0A0A0A]">Username</label>
                <input
                  type="text"
                  value={editingUser.username || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 rounded-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#0A0A0A]">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 rounded-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#0A0A0A]">Plan</label>
                <select
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#D4D4D8] focus:outline-none focus:border-[#0A0A0A] focus:border-2 rounded-none text-sm"
                >
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4 mt-8 border-t border-[#F4F4F5]">
                <button 
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 h-10 bg-transparent text-[#0A0A0A] border border-[#0A0A0A] text-sm hover:bg-[#F4F4F5] rounded-none transition-none"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 bg-[#0A0A0A] text-[#FAFAFA] text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed rounded-none transition-none"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
