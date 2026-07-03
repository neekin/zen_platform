# frozen_string_literal: true

module Admin
  class ArticlesController < AdminController
    before_action :set_article, only: [:show, :update, :destroy]

    # GET /admin/articles
    def index
      @articles = policy_scope(Article)
      @categories = Category.all

      render inertia: "admin/articles/Index",
        props: zen_props(Article,
          articles: @articles.as_json(
            include: {
              category: { only: [:id, :name] },
            }
          ),
          categories: @categories.as_json(only: [:id, :name]),
        )
    end

    # GET /admin/articles/:id
    def show
      authorize @article
      render inertia: "admin/articles/Show",
        props: {
          article: @article.as_json(
            include: {
              category: { only: [:id, :name] },
            }
          )
        }
    end

    # POST /admin/articles
    def create
      @article = Article.new(article_params)
      authorize @article
      if @article.save
        redirect_to admin_article_path(@article), notice: "创建成功"
      else
        redirect_to admin_articles_path, alert: @article.errors.full_messages.join(", ")
      end
    end

    # PATCH/PUT /admin/articles/:id
    def update
      authorize @article
      if @article.update(article_params)
        redirect_to admin_article_path(@article), notice: "更新成功"
      else
        redirect_to admin_articles_path, alert: @article.errors.full_messages.join(", ")
      end
    end

    # DELETE /admin/articles/:id
    def destroy
      authorize @article
      @article.destroy
      redirect_to admin_articles_path, notice: "删除成功"
    end

    private

    def set_article
      @article = Article.find(params[:id])
    end

    def article_params
      params.require(:article).permit(:title, :body, :category_id, :status, :is_featured)
    end
  end
end
