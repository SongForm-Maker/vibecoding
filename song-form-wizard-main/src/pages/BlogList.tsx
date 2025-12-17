import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { blogPosts } from "@/blog/posts";

const BlogList = () => {
  // 간단한 SEO: 블로그 목록 페이지 타이틀 설정
  document.title = "블로그 | Song Form Maker - 곡 구조와 작곡 팁";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-music-bg-subtle to-background">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-music-primary to-music-accent bg-clip-text text-transparent">
            블로그
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            곡 구조, 송폼 설계, 작곡 팁 등 정보를 정리한 글들을 모아두는 공간입니다. Song Form Maker를 더 깊이 활용하고
            싶다면 아래 글들을 참고해 보세요.
          </p>
        </div>

        <div className="space-y-4">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
              <Card className="p-5 sm:p-6 border border-border/70 bg-card/95 hover:border-music-primary/60 hover:shadow-md transition-all">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-music-primary">
                      {post.title}
                    </h2>
                    <span className="text-xs sm:text-sm text-muted-foreground">{post.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.description}</p>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-music-bg-subtle text-music-primary border border-music-primary/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogList;


