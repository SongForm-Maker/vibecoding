import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { blogPosts } from "@/blog/posts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  // SEO를 위한 기본 타이틀/메타 설명 설정
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Song Form Maker 블로그`;

      const metaDescription =
        document.querySelector<HTMLMetaElement>('meta[name="description"]') ??
        (() => {
          const meta = document.createElement("meta");
          meta.name = "description";
          document.head.appendChild(meta);
          return meta;
        })();

      metaDescription.content = post.description;
    } else {
      document.title = "글을 찾을 수 없습니다 | Song Form Maker 블로그";
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center space-y-3 px-4">
          <h1 className="text-2xl font-bold">글을 찾을 수 없습니다</h1>
          <p className="text-sm text-muted-foreground">요청하신 블로그 글이 존재하지 않거나 주소가 잘못되었습니다.</p>
          <Link to="/blog" className="text-sm text-primary underline hover:text-primary/90">
            블로그 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 단락 단위로 나누어 <p>로 렌더링
  const paragraphs = post.content.split(/\n{2,}/g);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-bg-subtle to-background">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-3xl">
        <div className="mb-6">
          <Link to="/blog" className="text-xs sm:text-sm text-primary underline hover:text-primary/90">
            ← 블로그 목록으로 돌아가기
          </Link>
        </div>

        <Card className="p-5 sm:p-8 bg-card/95 border border-border/70 shadow-md">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
              <span>{post.date}</span>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-music-bg-subtle text-music-primary border border-music-primary/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          <article className="prose prose-sm sm:prose-base max-w-none prose-p:leading-relaxed prose-headings:font-semibold dark:prose-invert">
            {paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </article>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;


