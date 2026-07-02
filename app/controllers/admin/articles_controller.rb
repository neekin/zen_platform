# frozen_string_literal: true

# Article 管理控制器（页面模式）
# 新增和编辑使用单独页面
module Admin
  class ArticlesController < AdminController
    before_action :require_login
    before_action :set_article, only: [:show, :edit, :update, :destroy]

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

    # GET /admin/articles/new
    def new
      @article = Article.new
      render inertia: "admin/articles/New"
    end

    # POST /admin/articles
    def create
      @article = Article.new(article_params)
      if @article.save
        redirect_to admin_articles_path(@article), notice: "创建成功"
      else
        render inertia: "admin/articles/New",
          props: { errors: @article.errors.full_messages }
      end
    end

    # GET /admin/articles/:id/edit
    def edit
      render inertia: "admin/articles/Edit",
        props: { article: @article.as_json }
    end

    # PATCH/PUT /admin/articles/:id
    def update
      if @article.update(article_params)
        redirect_to admin_articles_path(@article), notice: "更新成功"
      else
        render inertia: "admin/articles/Edit",
          props: { article: @article.as_json, errors: @article.errors.full_messages }
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
