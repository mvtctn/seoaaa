'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './contact.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Hỗ trợ kỹ thuật',
        message: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setIsSubmitted(true)
                setFormData({ name: '', email: '', subject: 'Hỗ trợ kỹ thuật', message: '' })
            } else {
                alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Lỗi kết nối. Vui lòng kiểm tra mạng.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <LandingNavbar />

            <section className={styles.hero}>
                <h1>Liên Hệ Với <span className={styles.gradient}>Chúng Tôi</span></h1>
                <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn tự động hóa quy trình SEO.</p>
            </section>

            <section className={styles.contactSection}>
                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>📧</div>
                            <div>
                                <h3>Email</h3>
                                <p>support@seoengine.com</p>
                                <p>sales@seoengine.com</p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>📍</div>
                            <div>
                                <h3>Địa Chỉ</h3>
                                <p>Khu Công Nghệ Cao, Quận 9</p>
                                <p>TP. Hồ Chí Minh, Việt Nam</p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>💬</div>
                            <div>
                                <h3>Hỗ Trợ Trực Tuyến</h3>
                                <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                                <p>Thứ 7: 8:00 - 12:00</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contactFormCard}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Họ và Tên</label>
                                    <input type="text" placeholder="Nguyễn Văn A" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input type="email" placeholder="email@example.com" required />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Chủ Đề</label>
                                <select required>
                                    <option value="">Chọn chủ đề...</option>
                                    <option>Hỗ trợ kỹ thuật</option>
                                    <option>Báo giá Enterprise</option>
                                    <option>Hợp tác đại lý</option>
                                    <option>Khác</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Tin Nhắn</label>
                                <textarea rows={5} placeholder="Nhập nội dung tin nhắn của bạn..." required></textarea>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {isSubmitted && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h2>Gửi Thành Công!</h2>
                        <p>Cảm ơn bạn đã liên hệ. Đội ngũ SEOAAA sẽ phản hồi bạn trong vòng 24 giờ tới.</p>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setIsSubmitted(false)}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            <LandingFooter />
        </div>
    )
}
