'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { Building, Search, Plus, Edit2, Trash2, X, MapPin, Users, Truck, User, UserPlus } from 'lucide-react';
import { getCompanies, createCompany, updateCompany, deleteCompany, getUsersForCompany, createUserForCompany, deleteUser } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface Company {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    country: string | null;
    _count?: {
        users: number;
        vehicles: number;
        drivers: number;
    }
}

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        country: ''
    });
    const [error, setError] = useState('');

    // User Management State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [companyUsers, setCompanyUsers] = useState<any[]>([]);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const router = useRouter();

    // Fetch Companies
    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await getCompanies();
            setCompanies(data);
        } catch (err) {
            console.error(err);
            // Basic protection: if fetch fails (likely auth), simpler to just show empty or redirect
            // checking session client side is also good but server action is secure
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                address: company.address || '',
                city: company.city || '',
                country: company.country || ''
            });
        } else {
            setEditingCompany(null);
            setFormData({ name: '', address: '', city: '', country: '' });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            setError('Company Name is required');
            return;
        }

        try {
            if (editingCompany) {
                const res = await updateCompany(editingCompany.id, formData);
                if (!res.success) {
                    setError(res.error || 'Failed to update');
                    return;
                }
            } else {
                const res = await createCompany(formData);
                if (!res.success) {
                    setError(res.error || 'Failed to create');
                    return;
                }
            }
            setIsModalOpen(false);
            loadCompanies();
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    const handleManageUsers = async (companyId: string) => {
        setSelectedCompanyId(companyId);
        const users = await getUsersForCompany(companyId);
        setCompanyUsers(users);
        setUserFormData({ name: '', email: '', password: '', role: 'user' });
        setIsUserModalOpen(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompanyId || !userFormData.name || !userFormData.email || !userFormData.password) {
            setError('All fields are required');
            return;
        }

        const res = await createUserForCompany(selectedCompanyId, userFormData);
        if (res.success) {
            const users = await getUsersForCompany(selectedCompanyId);
            setCompanyUsers(users);
            setUserFormData({ name: '', email: '', password: '', role: 'user' });
            loadCompanies();
        } else {
            setError(res.error || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        const res = await deleteUser(userId);
        if (res.success && selectedCompanyId) {
            const users = await getUsersForCompany(selectedCompanyId);
            setCompanyUsers(users);
            loadCompanies();
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        const res = await deleteCompany(id);
        if (res.success) {
            loadCompanies();
        } else {
            alert(res.error);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Company Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage client groups and their access</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <Plus size={20} />
                        Add Company
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all bg-white dark:bg-slate-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading companies...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map(company => (
                            <div key={company.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400">
                                                <Building size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{company.name}</h3>
                                                {company.city && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <MapPin size={12} />
                                                        {company.city}, {company.country}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenModal(company)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-600 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(company.id, company.name)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                                <Users size={12} /> Users
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-white">{company._count?.users || 0}</div>
                                        </div>
                                        <div className="text-center border-l border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                                <Truck size={12} /> Fleet
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-white">{company._count?.vehicles || 0}</div>
                                        </div>
                                        <div className="text-center border-l border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
                                                <User size={12} /> Drivers
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-white">{company._count?.drivers || 0}</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleManageUsers(company.id)}
                                        className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-medium text-sm"
                                    >
                                        <UserPlus size={16} />
                                        Manage Users
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                    {editingCompany ? 'Edit Company' : 'Add New Company'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="e.g. Acme Logistics"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="e.g. 123 Main St"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="e.g. Jakarta"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="e.g. Indonesia"
                                            value={formData.country}
                                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors shadow-sm"
                                    >
                                        {editingCompany ? 'Save Changes' : 'Create Company'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Management Modal */}
                {isUserModalOpen && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Manage Users</h3>
                                <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Add User Form */}
                                <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">Add New User</h4>
                                    {error && (
                                        <div className="p-2 bg-red-50 text-red-600 text-xs rounded mb-3">{error}</div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-cyan-500"
                                            value={userFormData.name}
                                            onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email"
                                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-cyan-500"
                                            value={userFormData.email}
                                            onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                                        />
                                        <input
                                            required
                                            type="password"
                                            placeholder="Password"
                                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-cyan-500"
                                            value={userFormData.password}
                                            onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                                        />
                                        <select
                                            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-cyan-500"
                                            value={userFormData.role}
                                            onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium"
                                    >
                                        <UserPlus size={14} className="inline mr-2" />
                                        Add User
                                    </button>
                                </form>

                                {/* Users List */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Company Users</h4>
                                    {companyUsers.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">No users yet</p>
                                    ) : (
                                        companyUsers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                                        {user.role}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-slate-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
