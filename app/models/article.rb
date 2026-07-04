class Article < ApplicationRecord
  include Zen::ModelDsl

  belongs_to :user, optional: true
  has_many :comments, dependent: :destroy

  # --- 字段定义 ---
  field :title, :string, required: true
  field :body, :rich_text
  field :internal_notes, :text
  field :status, :enum, values: %w[draft published archived], default: "draft"
  field :category, :string
  field :published_at, :datetime

  # --- 展示配置 ---
  display do
    list do
      column :title, link: true
      column :status, badge: true
      column :category
      column :published_at, format: :relative_time
      column :created_at, format: :relative_time
    end

    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
        field :category
        field :published_at, as: :datetime
      end
      section "内容" do
        field :body, as: :rich_text
      end
      section "内部备注" do
        field :internal_notes, as: :textarea
      end
    end

    detail do
      section "基本信息" do
        field :title, as: :heading
        field :status, as: :badge
        field :category
        field :published_at
      end
      section "内容" do
        field :body, as: :rich_text_viewer
      end
    end
  end

  scope :published, -> { where(status: "published") }

  # 批量操作
  batch_action :publish, label: "批量发布", confirm: "确定发布选中的文章？" do |ids|
    Article.where(id: ids).update_all(status: "published", published_at: Time.current)
  end

  batch_action :archive, label: "归档", confirm: "确定归档选中的文章？" do |ids|
    Article.where(id: ids).update_all(status: "archived")
  end
end
