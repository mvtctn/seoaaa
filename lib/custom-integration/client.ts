
interface PublishData {
    title: string;
    content: string; // HTML or Markdown
    slug: string;
    excerpt?: string;
    thumbnail_url?: string;
    meta_title?: string;
    meta_description?: string;
    schema?: string; // JSON-LD
    status: 'draft' | 'publish';
}

export const publishToCustomWebhook = async (
    webhookUrl: string,
    secretKey: string,
    data: PublishData
) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secretKey}`,
                'X-SeoAAA-Secret': secretKey // Alternative/Legacy
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Custom Webhook failed (${response.status}): ${errorText.substring(0, 200)}`);
        }

        let result;
        try {
            result = await response.json();
        } catch (e) {
            console.error('[Custom Webhook] Invalid JSON response');
            throw new Error(`Custom Webhook returned invalid JSON (${response.status})`);
        }

        return {
            success: true,
            link: result.url || result.link || null
        };
    } catch (error) {
        throw error;
    }
}
