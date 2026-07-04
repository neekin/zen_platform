class Comment < ApplicationRecord
  include Zen::ModelDsl

  belongs_to :article

  field :author_name, :string, required: true
  field :content, :text, required: true

  display do
    list do
      column :author_name
      column :content
      column :created_at, format: :relative_time
    end

    form do
      section "评论" do
        field :author_name, required: true
        field :content, as: :textarea, required: true
      end
    end
  end
end
