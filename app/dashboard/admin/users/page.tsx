
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './users.module.css'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' })
    const [addingUser, setAddingUser] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || user.user_metadata?.role !== 'admin') {
                router.push('/dashboard')
                return
            }
            setCurrentUser(user)
            fetchUsers()
        }
        checkAdmin()
    }, [router, supabase])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()
            if (data.users) {
                setUsers(data.users)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddingUser(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })
            if (res.ok) {
                setShowAddModal(false)
                setNewUser({ email: '', password: '', role: 'user' })
                fetchUsers()
            } else {
                const data = await res.json()
                alert(data.error || 'Có lỗi xảy ra khi thêm thành viên')
            }
        } catch (error) {
            console.error('Error adding user:', error)
        } finally {
            setAddingUser(false)
        }
    }

    const handleUpdateRole = async (userId: string, newRole: string) => {
        if (!confirm(`Bạn có chắc muốn đổi vai trò thành ${newRole}?`)) return

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole })
            })
            if (res.ok) {
                fetchUsers()
            }
        } catch (error) {
            console.error('Error updating role:', error)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser?.id) {
            alert('Bạn không thể xóa chính mình!')
            return
        }

        if (!confirm('Bạn có chắc muốn xóa người dùng này? Thao tác này không thể hoàn tác.')) return

        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            if (res.ok) {
                fetchUsers()
            }
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className="spinner spinner-lg mx-auto"></div>
                <p className="mt-4 text-secondary">Đang tải danh sách thành viên...</p>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>Quản Lý Thành Viên</h2>
                    <p className="text-sm text-secondary">Danh sách người dùng có quyền truy cập hệ thống</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Thêm thành viên
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={fetchUsers}>
                        Làm mới
                    </button>
                </div>
            </header>

            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Thêm Thành Viên Mới</h3>
                            <p className="text-sm text-secondary">Tạo tài khoản mới và xác nhận email tự động</p>
                        </div>

                        <form className={styles.form} onSubmit={handleAddUser}>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    className={styles.formInput}
                                    placeholder="user@example.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Mật khẩu</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className={styles.formInput}
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Vai trò</label>
                                <select
                                    className={styles.formInput}
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">User</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className="btn btn-ghost flex-1"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={addingUser}
                                >
                                    {addingUser ? 'Đang thêm...' : 'Thêm Thành Viên'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedUser && (
                <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Chi Tiết Thành Viên</h3>
                            <p className="text-sm text-secondary">Thông tin hồ sơ đầy đủ từ hệ thống</p>
                        </div>

                        <div className={styles.detailGrid}>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Email</span>
                                <span className={styles.detailValue}>{selectedUser.email}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>User ID</span>
                                <span className={styles.detailValue}>{selectedUser.id}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Họ và tên</span>
                                <span className={styles.detailValue}>{selectedUser.user_metadata?.full_name || '---'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Tên hiển thị</span>
                                <span className={styles.detailValue}>{selectedUser.user_metadata?.display_name || '---'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Số điện thoại</span>
                                <span className={styles.detailValue}>{selectedUser.user_metadata?.phone || '---'}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Công ty</span>
                                <span className={styles.detailValue}>{selectedUser.user_metadata?.company || '---'}</span>
                            </div>
                            <div className={`${styles.detailItem} fullWidth`}>
                                <span className={styles.detailLabel}>Website</span>
                                <span className={styles.detailValue}>
                                    {selectedUser.user_metadata?.website ? (
                                        <a href={selectedUser.user_metadata.website} target="_blank" className="text-blue-400 hover:underline">
                                            {selectedUser.user_metadata.website}
                                        </a>
                                    ) : '---'}
                                </span>
                            </div>
                            <div className={`${styles.detailItem} fullWidth`}>
                                <span className={styles.detailLabel}>Giới thiệu (Bio)</span>
                                <div className={styles.bioBox}>
                                    {selectedUser.user_metadata?.bio || 'Chưa có thông tin giới thiệu.'}
                                </div>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Ngày tham gia</span>
                                <span className={styles.detailValue}>{new Date(selectedUser.created_at).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Lần đăng nhập cuối</span>
                                <span className={styles.detailValue}>
                                    {selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString('vi-VN') : 'Chưa từng đăng nhập'}
                                </span>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className="btn btn-primary w-full"
                                onClick={() => setSelectedUser(null)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Thành viên</th>
                            <th>ID</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Đăng nhập cuối</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.empty}>Không tìm thấy thành viên</td>
                            </tr>
                        ) : (
                            users.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {user.email?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={styles.email}>{user.email}</div>
                                                <div className="text-[10px] text-tertiary">
                                                    {user.user_metadata?.display_name || user.user_metadata?.full_name || 'No data'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code className="text-[10px] opacity-60">{user.id.substring(0, 8)}...</code>
                                    </td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${user.user_metadata?.role === 'admin' ? styles.roleAdmin :
                                            user.user_metadata?.role === 'editor' ? styles.roleEditor :
                                                styles.roleUser
                                            }`}>
                                            {user.user_metadata?.role || 'User'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-secondary opacity-80">
                                            {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-secondary opacity-80">
                                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('vi-VN') : '---'}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.actionBtn}
                                            title="Xem chi tiết"
                                            onClick={() => setSelectedUser(user)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                        <select
                                            className="form-select text-[11px] py-1 px-2 h-auto w-auto"
                                            value={user.user_metadata?.role || 'user'}
                                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            title="Xóa người dùng"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
