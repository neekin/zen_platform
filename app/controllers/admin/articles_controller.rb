# frozen_string_literal: true

# Article 管理控制器
# 用于 Admin 后台的 CRUD 操作
# 对应的 React 页面位于: app/frontend/pages/admin/articles/
#
# 注意：AdminController 已配置自动从顶层命名空间查找模型
# 所以可以直接使用 Article 而不需要 ::Article
module Admin
  class ArticlesController < AdminController
    # 需要登录才能访问
    before_action :require_login
    # 需要加载记录的操作
    before_action :set_article, only: [:show, :edit, :update, :destroy]

    # GET /admin/articles
    # 列表页，显示所有 Article 记录
    # Props: { articles: Array }
    def index
      @articles = Article.all
      render inertia: "admin/articles/Index",
        props: { articles: @articles.as_json }
    end

    # GET /admin/articles/:id
    # 详情页，显示单条记录
    # Props: { article: Object }
    def show
      render inertia: "admin/articles/Show",
        props: { article: @article.as_json }
    end

    # GET /admin/articles/new
    # 新建页面
    def new
      @article = Article.new
      render inertia: "admin/articles/New"
    end

    # POST /admin/articles
    # 创建新记录
    # 成功后跳转到详情页，失败则重新显示表单
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
    # 编辑页面
    # Props: { article: Object }
    def edit
      render inertia: "admin/articles/Edit",
        props: { article: @article.as_json }
    end

    # PATCH/PUT /admin/articles/:id
    # 更新记录
    # 成功后跳转到详情页，失败则重新显示表单
    def update
      if @article.update(article_params)
        redirect_to admin_articles_path(@article), notice: "更新成功"
      else
        render inertia: "admin/articles/Edit",
          props: { article: @article.as_json, errors: @article.errors.full_messages }
      end
    end

    # DELETE /admin/articles/:id
    # 删除记录
    # 成功后跳转到列表页
    def destroy
      @article.destroy
      redirect_to admin_articles_path, notice: "删除成功"
    end

    private

    # 加载单条记录，用于 show/edit/update/destroy 操作
    def set_article
      @article = Article.find(params[:id])
    end

    # 强参数配置
    # TODO: 根据实际需求调整允许的字段
    def article_params
      params.require(:article).permit(:title, :body, :status)
    end
  end
end
