# frozen_string_literal: true

module Admin
  class ProductsController < AdminController
    before_action :set_product, only: [:show, :update, :destroy]

    # GET /admin/products
    def index
      @products = policy_scope(Product)
      render inertia: "admin/products/Index",
        props: zen_props(Product, products: @products.as_json)
    end

    # GET /admin/products/:id
    def show
      authorize @product
      render inertia: "admin/products/Show",
        props: { product: @product.as_json }
    end

    # POST /admin/products
    def create
      @product = Product.new(product_params)
      authorize @product
      if @product.save
        redirect_to admin_product_path(@product), notice: "创建成功"
      else
        redirect_to admin_products_path, alert: @product.errors.full_messages.join(", ")
      end
    end

    # PATCH/PUT /admin/products/:id
    def update
      authorize @product
      if @product.update(product_params)
        redirect_to admin_product_path(@product), notice: "更新成功"
      else
        redirect_to admin_products_path, alert: @product.errors.full_messages.join(", ")
      end
    end

    # DELETE /admin/products/:id
    def destroy
      authorize @product
      @product.destroy
      redirect_to admin_products_path, notice: "删除成功"
    end

    private

    def set_product
      @product = Product.find(params[:id])
    end

    def product_params
      params.require(:product).permit(:name, :price, :description, :status)
    end
  end
end
