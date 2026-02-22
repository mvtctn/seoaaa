import Link from 'next/link'
import styles from './pricing.module.css'
import LandingNavbar from '@/components/LandingNavbar'
import LandingFooter from '@/components/LandingFooter'
import DotLinkBackground from '@/components/DotLinkBackground'
import PricingCard from '@/components/PricingCard'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
    const supabase = createClient()

    // Fetch active plans from database
    const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

    // Fallback if no plans found in DB
    const displayPlans = (plans && plans.length > 0) ? plans : [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            credits: 5000,
            features: ["5,000 Seodong", "1 bài viết SEO chất lượng cao", "Gợi ý từ khóa cơ bản"],
            is_popular: false,
            description: "Khởi đầu hành trình SEO của bạn"
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 990000,
            credits: 990000,
            features: ["990,000 Seodong", "~150-200 bài viết SEO hoàn chỉnh", "Tạo hình ảnh AI không giới hạn", "Batch processing tốc độ cao"],
            is_popular: true,
            description: "Cho Professional & Freelancer"
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 2990000,
            credits: 2990000,
            features: ["2,990,000 Seodong", "Hỗ trợ đa thương hiệu (Multi-brand)", "Hệ thống AI Orchestrator nâng cao", "Xuất bản trực tiếp lên CMS"],
            is_popular: false,
            description: "Cho Agencies & Doanh nghiệp"
        }
    ]

    return (
        <div className={styles.container}>
            <LandingNavbar />
            <DotLinkBackground />

            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <span className={styles.badgePulse}></span>
                        Giá Cả Minh Bạch
                    </div>
                    <h1>Chọn Gói Phù Hợp<br /><span className={styles.gradient}>Với Nhu Cầu</span></h1>
                    <p>Không có chi phí ẩn. Hủy bất cứ lúc nào.</p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className={styles.pricing}>
                <div className={styles.pricingGrid}>
                    {displayPlans.map((plan: any) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan.name}
                            tierKey={plan.tier_key}
                            price={plan.price}
                            credits={plan.seodong || plan.credits}
                            features={Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]')}
                            isPopular={plan.is_popular}
                            description={plan.description || (plan.price === 0 ? "Khởi đầu hành trình SEO của bạn" : undefined)}
                        />
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className={styles.faq}>
                <h2>Câu Hỏi Thường Gặp</h2>
                <div className={styles.faqGrid}>
                    <div className={styles.faqItem}>
                        <h3>Tôi có thể hủy bất cứ lúc nào không?</h3>
                        <p>Có! Không có cam kết dài hạn. Bạn có thể hủy subscription bất cứ lúc nào từ dashboard.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3>Tôi có thể nâng cấp/hạ cấp gói không?</h3>
                        <p>Hoàn toàn được. Thay đổi gói sẽ có hiệu lực ngay lập tức và được tính tiền theo tỷ lệ.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3>Có giới hạn số lượng từ mỗi bài không?</h3>
                        <p>Không! Mỗi bài viết thường dài 2000-3000 từ tùy thuộc vào từ khóa và research.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h3>Tôi sở hữu nội dung được tạo ra?</h3>
                        <p>100%! Tất cả nội dung được tạo thuộc về bạn để sử dụng theo bất kỳ cách nào.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <h2>Bắt Đầu Miễn Phí Hôm Nay</h2>
                <p>Không cần thẻ tín dụng. Bắt đầu với một bài viết chất lượng miễn phí.</p>
                <Link href="/contact" className={styles.ctaButton}>
                    Tạo Bài Viết Đầu Tiên
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </section>

            <LandingFooter />
        </div>
    )
}
