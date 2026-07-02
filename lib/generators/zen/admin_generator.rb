# frozen_string_literal: true

require "rails/generators"
require "rails/generators/active_record"

module Zen
  class AdminGenerator < Rails::Generators::NamedBase
    include Rails::Generators::ResourceHelpers
    include ActiveRecord::Generators::Migration

    source_root File.expand_path("admin/templates", __dir__)
    desc "Generate Admin CRUD controller and React pages"

    argument :attributes, type: :array, default: [], banner: "field:type field:type"

    def create_controller
      template "controller.rb.tt", "app/controllers/admin/#{plural_name}_controller.rb"
    end

    def create_index_page
      template "index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Index.tsx"
    end

    def create_show_page
      template "show.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Show.tsx"
    end

    def create_new_page
      template "new.tsx.tt", "app/frontend/pages/admin/#{plural_name}/New.tsx"
    end

    def create_edit_page
      template "edit.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Edit.tsx"
    end

    def add_routes
      route <<~RUBY
        resources :#{plural_name}, only: [:index, :show, :new, :create, :edit, :update, :destroy]
      RUBY
    end

    private

    def attributes_names
      attributes.map(&:name)
    end

    def permitted_params
      attributes.map { |a| ":#{a.name}" }.join(", ")
    end

    def columns_for_table
      attributes.map { |a| { name: a.name, type: a.type } }
    end
  end
end
