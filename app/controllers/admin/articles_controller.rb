# frozen_string_literal: true

module Admin
  class ArticlesController < AdminController
    # 包含 Pagy 分页方法
    include Pagy::Method

    before_action :set_article, only: [:show, :update, :destroy]

    # GET /admin/articles
    def index
      # 使用 Ransack 搜索和过滤
      q = Article.ransack(search_params)
      base_query = q.result(distinct: true)

      # 使用授权作用域（如果使用了 Pundit）
      base_query = policy_scope(base_query) if defined?(policy_scope)

      # 使用 Pagy 分页
      @pagy, records = pagy(:offset, base_query, **pagy_params)



      render inertia: "admin/articles/Index",
        props: zen_props(Article,
          articles: records.map { |r| r.as_json(
            include: {

            }
          ) },
          pagination: {
            page: @pagy.page,
            per_page: @pagy.limit,
            total: @pagy.count,
            pages: @pagy.pages
          },
          search_params: search_params

        )
    end

    # GET /admin/articles/:id
    def show
      authorize @article
      render inertia: "admin/articles/Show",
        props: {
          article: @article.as_json(
            include: {

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
      params.require(:article).permit(:title, :body)
    end

    # Pagy 分页参数
    def pagy_params
      {
        page: (params[:page]  || 1).to_i,
        limit: (params[:per_page] || 20).to_i.clamp(1, 100)
      }
    end

    # Ransack 搜索参数
    def search_params
      return {} unless params[:q].present?
      params[:q].permit(:name_cont, :email_cont, :title_cont).to_h
    end
  end
end
