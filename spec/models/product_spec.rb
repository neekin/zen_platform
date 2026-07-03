# frozen_string_literal: true

require "rails_helper"

RSpec.describe Product, type: :model do
  let(:product) { Product.create!(name: "Widget", price: 9.99) }

  describe "validations" do
    it "requires name" do
      product.name = nil
      expect(product).not_to be_valid
    end

    it "rejects negative price" do
      product.price = -1
      expect(product).not_to be_valid
    end

    it "allows nil price" do
      product.price = nil
      expect(product).to be_valid
    end
  end
end
