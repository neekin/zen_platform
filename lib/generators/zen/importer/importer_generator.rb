# frozen_string_literal: true

require "rails/generators"
require "rails/generators/active_record"

module Zen
  class ImporterGenerator < Rails::Generators::NamedBase
    include Rails::Generators::Migration

    source_root File.expand_path("templates", __dir__)

    desc "生成数据导入器骨架"
    argument :name, type: :string, desc: "模型名称（如 Article）"

    def create_importer
      template "importer.rb.tt", "app/importers/#{file_name}_importer.rb"
    end

    def create_import_controller
      template "controller.rb.tt", "app/controllers/admin/#{file_name}_imports_controller.rb"
    end

    def create_import_view
      template "index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Import.tsx"
    end

    def add_route
      route "resources :#{plural_name}, only: [] do
        collection do
          get :import, to: '#{plural_name}#import_page'
          post :import, to: '#{plural_name}#process_import'
        end
      end"
    end

    def show_readme
      readme "README" if behavior == :invoke
    end

    private

    def file_name
      name.underscore
    end

    def plural_name
      file_name.pluralize
    end

    def class_name
      name.camelize
    end

    def model_class
      class_name.constantize
    rescue NameError
      nil
    end

    def fields
      return @fields if defined?(@fields)

      model = model_class
      return [] unless model&.respond_to?(:zen_fields)

      @fields = model.zen_fields.map do |key, field_def|
        {
          name: key.to_s,
          type: field_def.type.to_s,
          required: field_def.required?,
        }
      end
    rescue
      @fields = []
    end
  end
end
