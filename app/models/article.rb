class Article < ApplicationRecord
  include Zen::ModelDsl

  # 字段定义
  field :title, :string, required: true, placeholder: "请输入文章标题"
  field :body, :rich_text, required: true
  field :status, :enum, values: %w[draft published archived], default: "draft"
  field :is_featured, :boolean, default: false

  # 关联
  belongs_to :category, optional: true

  # 展示配置
  display do
    list do
      column :title, link: true
      column :status, badge: true
      column :is_featured, badge: true
      column :created_at, format: :relative_time
    end

    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
        field :is_featured, as: :switch
      end
      section "内容" do
        field :body, as: :rich_text
      end
    end

    detail do
      section "基本信息" do
        field :title, as: :heading
        field :status, as: :badge
        field :is_featured, as: :badge
        field :created_at
        field :updated_at
      end
      section "内容" do
        field :body, as: :rich_text_viewer
      end
    end
  end
end
