require "rails/generators"
require "rails/generators/migration"

module Zen
  module Generators
    class ExampleGenerator < Rails::Generators::Base
      include Rails::Generators::Migration

      desc "生成示例模型（Article + Comment），展示 DSL 核心能力"

      source_root File.expand_path("templates", __dir__)

      def create_migrations
        migration_template "articles_migration.rb", "db/migrate/create_articles.rb"
        migration_template "comments_migration.rb", "db/migrate/create_comments.rb"
      end

      def create_models
        template "article_model.rb", "app/models/article.rb"
        template "comment_model.rb", "app/models/comment.rb"
      end

      def create_controllers
        template "articles_controller.rb", "app/controllers/admin/articles_controller.rb"
        template "comments_controller.rb", "app/controllers/admin/comments_controller.rb"
      end

      def create_frontend_pages
        template "articles_index.tsx", "app/frontend/pages/admin/articles/Index.tsx"
        template "articles_show.tsx", "app/frontend/pages/admin/articles/Show.tsx"
        template "comments_index.tsx", "app/frontend/pages/admin/comments/Index.tsx"
      end

      def add_routes
        route "namespace :admin do\n    resources :articles\n    resources :comments\n  end"
      end

      def remind_menu
        say "\n= 请手动完成以下步骤 =", :yellow
        say "1. 在 app/frontend/config/adminMenus.tsx 添加菜单项："
        say "   { path: '/admin/articles', name: '文章管理', icon: <FileTextOutlined /> }"
        say "   { path: '/admin/comments', name: '评论管理', icon: <CommentOutlined /> }"
        say "\n2. 运行数据库迁移："
        say "   bin/rails db:migrate"
        say "\n3.（可选）添加示例数据到 db/seeds.rb"
      end

      def self.next_migration_number(dirname)
        next_migration_number = current_migration_number(dirname) + 1
        Time.current.utc.strftime("%Y%m%d%H%M%S") + next_migration_number.to_s.rjust(3, "0")
      end
    end
  end
end
