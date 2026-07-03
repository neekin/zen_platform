class Product < ApplicationRecord
  include Zen::ModelDsl
  track_changes

  validates :name, presence: true
  validates :price, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  field :name, :string, required: true, placeholder: "请输入产品名称"
  field :price, :decimal
  field :description, :text
  field :status, :enum, values: %w[active inactive archived], default: "active"

  display do
    list do
      column :name, link: true
      column :price, format: :currency
      column :status, badge: true
      column :created_at, format: :relative_time
    end

    form do
      section "基本信息" do
        field :name, required: true
        field :price
        field :status, as: :radio
        field :description
      end
    end
  end
end
