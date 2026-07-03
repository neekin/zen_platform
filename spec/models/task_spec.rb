# frozen_string_literal: true

require "rails_helper"

RSpec.describe Task, type: :model do
  let(:task) { Task.create!(title: "Test Task") }

  describe "validations" do
    it "requires title" do
      task.title = nil
      expect(task).not_to be_valid
    end

    it "validates status inclusion" do
      task.status = "invalid"
      expect(task).not_to be_valid
    end

    it "accepts valid statuses" do
      %w[todo doing done].each do |s|
        task.status = s
        expect(task).to be_valid
      end
    end
  end

  describe "defaults" do
    it "defaults status to todo" do
      expect(task.status).to eq("todo")
    end

    it "defaults position to 0" do
      expect(task.position).to eq(0)
    end
  end

  describe ".ordered" do
    it "orders by position" do
      t1 = Task.create!(title: "First", position: 2)
      t2 = Task.create!(title: "Second", position: 1)
      expect(Task.ordered).to eq([t2, t1])
    end
  end
end
