'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './contact.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'
import DotLinkBackground from '@/components/DotLinkBackground'

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
                const data = await res.json()
                alert(data.error || 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.')
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
                <DotLinkBackground />
                <h1>Liên Hệ Với <span className={styles.gradient}>Chúng Tôi</span></h1>
                <p>Đội ngũ BizLite Soft luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, chuyên gia của chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
            </section>

            <section className={styles.contactSection}>
                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>🏢</div>
                            <div>
                                <h3>Công ty TNHH BizLite Soft</h3>
                                <p>Mã số thuế: 0109xxxxxx</p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>📍</div>
                            <div>
                                <h3>Trụ sở chính</h3>
                                <p>Tầng 4, Tòa nhà N07B1.2, Đường Thành Phái,</p>
                                <p>Phường Cầu Giấy, TP Hà Nội, Việt Nam</p>
                            </div>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>📞</div>
                            <div>
                                <h3>Liên hệ</h3>
                                <p>Hotline: 0967 60 8585</p>
                                <p>Email: info@bizlitecrm.com</p>
                                <p>8:00 - 17:30 (Thứ 2 - Thứ 7)</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contactFormCard}>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Họ và Tên</label>
                                    <input
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Chủ Đề</label>
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="Hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật</option>
                                    <option value="Báo giá Enterprise">Báo giá Enterprise</option>
                                    <option value="Hợp tác đại lý">Hợp tác đại lý</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Tin Nhắn</label>
                                <textarea
                                    rows={5}
                                    placeholder="Nhập nội dung tin nhắn của bạn..."
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
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
