
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import styles from './user.module.css'

export default async function UserPage() {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className={styles.container}>
            <div className={styles.orb1}></div>
            <div className={styles.orb2}></div>
            <div className={styles.dots}></div>
            <div className={styles.card}>
                <div className={styles.avatar}>
                    {user.email?.[0].toUpperCase()}
                </div>
                <div>
                    <h2 className={styles.title}>
                        Thông tin tài khoản
                    </h2>
                    <p className={styles.subtitle}>
                        Quản lý chi tiết tài khoản của bạn
                    </p>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.field}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>{user.email}</span>
                    </div>
                    <div className={styles.field}>
                        <span className={styles.label}>User ID</span>
                        <span className={styles.codeLike}>{user.id}</span>
                    </div>
                    <div className={styles.field}>
                        <span className={styles.label}>Vai trò</span>
                        <span className={styles.value} style={{ textTransform: 'capitalize' }}>
                            {user.user_metadata?.role || user.role || 'Thành viên'}
                        </span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <a href="/dashboard/profile" className={`${styles.button} ${styles.primaryButton}`} style={{ width: '100%', marginBottom: '0.5rem' }}>
                        Cập nhật Profile
                    </a>

                    <a href="/dashboard" className={`${styles.button} ${styles.secondaryButton}`}>
                        Vào Dashboard
                    </a>

                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className={`${styles.button} ${styles.dangerButton}`}
                        >
                            Sigout (Đăng xuất)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
