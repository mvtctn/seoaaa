// app/api/receive-article/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    // 1. Verify Secret Key
    const authHeader = req.headers.get('Authorization');
    const secret = authHeader?.replace('Bearer ', '');

    if (secret !== process.env.SEOAAA_SECRET) { // Matches the key you entered in SeoAAA
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Receive Article Data
    const data = await req.json();
    // data contains: { title, content, slug, excerpt, thumbnail_url, meta_title, ... }

    console.log('Received article:', data.title);

    // 3. Save to your database (Example with Prisma)
    // const post = await prisma.post.create({
    //   data: {
    //     title: data.title,
    //     content: data.content, // HTML content
    //     slug: data.slug,
    //     image: data.thumbnail_url,
    //     published: data.status === 'publish'
    //   }
    // });

    // 4. Return Success & Link
    return NextResponse.json({
        success: true,
        link: `https://siphonet.com/blog/${data.slug}` // The public URL of the post
    });
}