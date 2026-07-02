# frozen_string_literal: true

# Article 管理控制器
# 用于 Admin 后台的 CRUD 操作
# 对应的 React 页面位于: app/frontend/pages/admin/articles/
#
# 注意：AdminController 已配置自动从顶层命名空间查找模型
# 所以可以直接使用 Article 而不需要 ::Article
module Admin
  class ArticlesController < AdminController
    before_action :require_login
    before_action :set_article, only: [:show, :update, :destroy]

    # GET /admin/articles
    def index
      @articles = Article.all
      render inertia: "admin/articles/Index",
        props: { articles: @articles.as_json }
    end

    # GET /admin/articles/:id
    def show
      render inertia: "admin/articles/Show",
        props: { article: @article.as_json }
    end

    # POST /admin/articles
    def create
      @article = Article.new(article_params)
      if @article.save
        redirect_to admin_articles_path(@article), notice: "创建成功"
      else
        redirect_to admin_articles_path, alert: @article.errors.full_messages.join(", ")
      end
    end

    # PATCH/PUT /admin/articles/:id
    def update
      if @article.update(article_params)
        redirect_to admin_articles_path(@article), notice: "更新成功"
      else
        redirect_to admin_articles_path, alert: @article.errors.full_messages.join(", ")
      end
    end

    # DELETE /admin/articles/:id
    def destroy
      @article.destroy
      redirect_to admin_articles_path, notice: "删除成功"
    end

    private

    def set_article
      @article = Article.find(params[:id])
    end

    def article_params
      params.require(:article).permit(:title, :body, :status)
    end
  end
end
