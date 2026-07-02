# frozen_string_literal: true

require "rails/generators"
require "rails/generators/active_record"

module Zen
  class ApiGenerator < Rails::Generators::NamedBase
    include Rails::Generators::ResourceHelpers
    include ActiveRecord::Generators::Migration

    source_root File.expand_path("api/templates", __dir__)
    desc "Generate API CRUD controller with rswag tests"

    argument :attributes, type: :array, default: [], banner: "field:type field:type"

    def create_controller
      template "controller.rb.tt", "app/controllers/api/v1/#{plural_name}_controller.rb"
    end

    def create_spec
      template "spec.rb.tt", "spec/requests/api/v1/#{plural_name}_spec.rb"
    end

    def add_routes
      route <<~RUBY
        resources :#{plural_name}, only: [:index, :show, :create, :update, :destroy]
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

    def openapi_type(ruby_type)
      case ruby_type
      when "integer" then "integer"
      when "decimal", "float" then "number"
      when "boolean" then "boolean"
      when "datetime", "date", "time" then "string"
      else "string"
      end
    end
  end
end
