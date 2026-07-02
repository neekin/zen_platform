# frozen_string_literal: true

# Product 管理控制器
# 用于 Admin 后台的 CRUD 操作
# 对应的 React 页面位于: app/frontend/pages/admin/products/
#
# 注意：AdminController 已配置自动从顶层命名空间查找模型
# 所以可以直接使用 Product 而不需要 ::Product
module Admin
  class ProductsController < AdminController
    before_action :require_login
    before_action :set_product, only: [:show, :update, :destroy]

    # GET /admin/products
    def index
      @products = Product.all
      render inertia: "admin/products/Index",
        props: { products: @products.as_json }
    end

    # GET /admin/products/:id
    def show
      render inertia: "admin/products/Show",
        props: { product: @product.as_json }
    end

    # POST /admin/products
    def create
      @product = Product.new(product_params)
      if @product.save
        redirect_to admin_products_path(@product), notice: "创建成功"
      else
        redirect_to admin_products_path, alert: @product.errors.full_messages.join(", ")
      end
    end

    # PATCH/PUT /admin/products/:id
    def update
      if @product.update(product_params)
        redirect_to admin_products_path(@product), notice: "更新成功"
      else
        redirect_to admin_products_path, alert: @product.errors.full_messages.join(", ")
      end
    end

    # DELETE /admin/products/:id
    def destroy
      @product.destroy
      redirect_to admin_products_path, notice: "删除成功"
    end

    private

    def set_product
      @product = Product.find(params[:id])
    end

    def product_params
      params.require(:product).permit(:name, :price)
    end
  end
end
