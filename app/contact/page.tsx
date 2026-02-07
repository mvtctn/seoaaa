import Link from 'next/link'
import styles from './contact.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'

export default function ContactPage() {
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
                        <form className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Họ và Tên</label>
                                    <input type="text" placeholder="Nguyễn Văn A" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input type="email" placeholder="email@example.com" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Chủ Đề</label>
                                <select>
                                    <option>Hỗ trợ kỹ thuật</option>
                                    <option>Báo giá Enterprise</option>
                                    <option>Hợp tác đại lý</option>
                                    <option>Khác</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Tin Nhắn</label>
                                <textarea rows={5} placeholder="Nhập nội dung tin nhắn của bạn..."></textarea>
                            </div>

                            <button type="submit" className={styles.submitBtn}>Gửi Tin Nhắn</button>
                        </form>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    )
}
