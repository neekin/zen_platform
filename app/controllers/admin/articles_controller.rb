# frozen_string_literal: true

module Admin
  class ArticlesController < AdminController
    before_action :set_article, only: [:show, :update, :destroy]

    def index
      @articles = policy_scope(Article)
      render inertia: "admin/articles/Index",
        props: zen_props(Article, articles: @articles.as_json)
    end

    def show
      authorize @article
      render inertia: "admin/articles/Show",
        props: zen_props(Article, article: @article.as_json(include: :comments))
    end

    def create
      @article = Article.new(article_params)
      authorize @article
      if @article.save
        redirect_to admin_article_path(@article), notice: "文章创建成功"
      else
        redirect_to admin_articles_path, alert: @article.errors.full_messages.join(", ")
      end
    end

    def update
      authorize @article
      if @article.update(article_params)
        redirect_to admin_article_path(@article), notice: "文章更新成功"
      else
        redirect_to admin_article_path(@article), alert: @article.errors.full_messages.join(", ")
      end
    end

    def destroy
      authorize @article
      @article.destroy
      redirect_to admin_articles_path, notice: "文章已删除"
    end

    private

    def set_article
      @article = Article.find(params[:id])
    end

    def article_params
      params.require(:article).permit(:title, :body, :internal_notes, :status, :category, :published_at, :user_id)
    end
  end
end
