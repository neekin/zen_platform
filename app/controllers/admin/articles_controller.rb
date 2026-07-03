# frozen_string_literal: true

module Admin
  class ArticlesController < AdminController
    before_action :set_article, only: [:show, :update, :destroy]

    # GET /admin/articles
    def index
      @articles = policy_scope(Article)
      @categories = Category.all

      # 搜索
      if params[:q].present?
        @articles = @articles.where("title LIKE ?", "%#{params[:q]}%")
      end

      # 筛选
      @articles = @articles.where(status: params[:status]) if params[:status].present?
      @articles = @articles.where(category_id: params[:category_id]) if params[:category_id].present?

      # 分页
      page = (params[:page] || 1).to_i
      per_page = (params[:per_page] || 20).to_i.clamp(1, 100)
      total = @articles.count
      @articles = @articles.offset((page - 1) * per_page).limit(per_page)

      render inertia: "admin/articles/Index",
        props: zen_props(Article,
          articles: @articles.as_json(
            include: {
              category: { only: [:id, :name] },
            }
          ),
          categories: @categories.as_json(only: [:id, :name]),
          pagination: { current_page: page, per_page: per_page, total: total },
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

    # POST /admin/articles/bulk_destroy
    def bulk_destroy
      authorize Article, :destroy?
      Article.where(id: params[:ids]).destroy_all
      redirect_to admin_articles_path, notice: "批量删除成功"
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
