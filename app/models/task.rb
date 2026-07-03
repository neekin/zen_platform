class Task < ApplicationRecord
  include Zen::ModelDsl
  track_changes

  belongs_to :user, optional: true

  validates :title, presence: true
  validates :status, inclusion: { in: %w[todo doing done] }

  scope :ordered, -> { order(position: :asc) }

  field :title, :string, required: true, placeholder: "请输入任务标题"
  field :description, :text
  field :status, :enum, values: %w[todo doing done], default: "todo"
  field :position, :integer

  display do
    list do
      column :title, link: true
      column :status, badge: true
      column :created_at, format: :relative_time
    end

    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
        field :description
      end
    end
  end
end
