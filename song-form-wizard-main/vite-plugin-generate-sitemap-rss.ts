import type { Plugin } from "vite";
import { writeFileSync } from "fs";
import { join } from "path";

// XML 특수 문자 이스케이프
const escapeXml = (str: string) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// 현재 날짜를 ISO 형식으로 반환
const getCurrentDate = () => new Date().toISOString();

// sitemap과 RSS 생성 함수
async function generateFiles() {
  try {
    // posts.ts 동적 import
    const postsModule = await import("./src/blog/posts.ts");
    const blogPosts = postsModule.blogPosts;

    // 사이트 기본 URL (환경 변수에서 가져오거나 기본값 사용)
    const BASE_URL =
      process.env.VITE_SITE_URL || process.env.SITE_URL || "https://vibecoding-blue-psi.vercel.app";

    // sitemap.xml 생성
    const urls = [
      {
        loc: `${BASE_URL}/`,
        changefreq: "weekly",
        priority: "1.0",
      },
      {
        loc: `${BASE_URL}/blog`,
        changefreq: "weekly",
        priority: "0.8",
      },
      // 블로그 포스트 URL 추가
      ...blogPosts.map((post: any) => ({
        loc: `${BASE_URL}/blog/${post.slug}`,
        changefreq: "monthly",
        priority: "0.7",
        lastmod: new Date(post.date).toISOString().split("T")[0],
      })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : ""}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    // RSS 피드 생성
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Song Form Maker - 곡 구조와 작곡 팁 블로그</title>
    <link>${BASE_URL}</link>
    <description>송폼(Song Form)과 곡 구조에 대한 정보, 작곡 팁, 그리고 Song Form Maker 사용법을 다루는 블로그입니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${getCurrentDate()}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${blogPosts
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(
        (post: any) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${post.slug}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/blog/${post.slug}</guid>
    </item>`
      )
      .join("\n")}
  </channel>
</rss>`;

    // public 디렉토리에 파일 생성
    const publicDir = join(process.cwd(), "public");
    writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf-8");
    writeFileSync(join(publicDir, "rss.xml"), rss, "utf-8");

    console.log("✅ sitemap.xml과 rss.xml이 성공적으로 생성되었습니다!");
    console.log(`   - sitemap.xml: ${blogPosts.length + 2}개 URL 포함`);
    console.log(`   - rss.xml: ${blogPosts.length}개 포스트 포함`);
  } catch (error) {
    console.error("❌ sitemap/rss 생성 중 오류 발생:", error);
  }
}

export function generateSitemapRss(): Plugin {
  return {
    name: "generate-sitemap-rss",
    async buildStart() {
      await generateFiles();
    },
    async configureServer() {
      // 개발 서버 시작 시에도 생성
      await generateFiles();
    },
  };
}

