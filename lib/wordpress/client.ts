
export interface WordPressConfig {
    url: string;
    username: string;
    applicationPassword: string;
}

export interface WordPressPost {
    title: string;
    content: string;
    status: 'publish' | 'draft' | 'pending' | 'private';
    slug?: string;
    excerpt?: string;
    categories?: number[];
    tags?: number[];
    featured_media?: number;
    meta?: Record<string, any>;
}

export async function publishToWordPress(config: WordPressConfig, post: WordPressPost) {
    const { url, username, applicationPassword } = config;

    // Normalize URL
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const apiUrl = `${baseUrl}/wp-json/wp/v2/posts`;

    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64');

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        const text = await response.text();
        console.error('[WordPress Client] Non-JSON Response:', text);
        throw new Error(`WordPress API returned invalid JSON (${response.status}). Check URL and Auth.`);
    }

    if (!response.ok) {
        console.error('[WordPress Client] Error:', data);
        throw new Error(data.message || `Failed to publish to WordPress (${response.status})`);
    }

    return data;
}

export async function uploadImageToWordPress(config: WordPressConfig, imageUrl: string, title?: string) {
    const { url, username, applicationPassword } = config;

    // Normalize URL
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    const apiUrl = `${baseUrl}/wp-json/wp/v2/media`;

    const credentials = Buffer.from(`${username}:${applicationPassword}`).toString('base64');

    // Fetch the image
    const imageRes = await fetch(imageUrl);
    const blob = await imageRes.blob();
    const fileName = imageUrl.split('/').pop() || 'image.jpg';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Type': blob.type,
        },
        body: blob,
    });

    let data;
    try {
        data = await response.json();
    } catch (e) {
        console.error('[WordPress Client] Media Upload Non-JSON Response');
        return null;
    }

    if (!response.ok) {
        console.error('[WordPress Client] Media Upload Error:', data);
        return null;
    }

    return data.id; // Return the attachment ID
}
