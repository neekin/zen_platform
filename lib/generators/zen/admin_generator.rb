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
    class_option :modal, type: :boolean, default: nil, desc: "Use modal form for create/edit"
    class_option :page, type: :boolean, default: nil, desc: "Use separate pages for create/edit"

    def ask_form_style
      return if options[:modal] || options[:page]

      say ""
      say "请选择表单模式："
      say "  1. 浮层表单（Modal） - 新增/编辑使用弹窗"
      say "  2. 独立页面（Page）   - 新增/编辑使用单独页面"
      say ""
      answer = ask("请输入选项 (1/2) [默认: 1]:").presence || "1"
      @use_modal = answer.strip == "1"
    end

    def create_controller
      template "#{template_prefix}/controller.rb.tt", "app/controllers/admin/#{plural_name}_controller.rb"
    end

    def create_index_page
      template "#{template_prefix}/index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Index.tsx"
    end

    def create_page_files
      return if use_modal?

      template "page/show.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Show.tsx"
      template "page/new.tsx.tt", "app/frontend/pages/admin/#{plural_name}/New.tsx"
      template "page/edit.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Edit.tsx"
    end

    def add_routes
      if use_modal?
        route_config = "\n    resources :#{plural_name}, only: [:index, :show, :create, :update, :destroy]"
      else
        route_config = "\n    resources :#{plural_name}"
      end
      insert_into_file "config/routes.rb", route_config, after: 'delete "logout", to: "sessions#destroy"'
    end

    def show_readme
      say ""
      say "=" * 60
      if behavior == :invoke
        say "生成完成！（#{use_modal? ? '浮层表单' : '独立页面'}模式）"
        say "=" * 60
        say ""
        say "请手动添加侧边栏菜单："
        say ""
        say "1. 打开配置文件: app/frontend/config/adminMenus.tsx"
        say ""
        say "2. 在 routes 数组中添加以下内容："
        say ""
        say "  {"
        say "    path: '/admin/#{plural_name}',"
        say "    name: '#{class_name}管理',"
        say "    icon: <FileTextOutlined />,"
        say "  },"
        say ""
        say "3. 在文件顶部导入图标："
        say "   import { FileTextOutlined } from '@ant-design/icons'"
      else
        say "销毁完成！"
        say "=" * 60
        say ""
        say "请手动删除侧边栏菜单配置："
        say ""
        say "1. 打开配置文件: app/frontend/config/adminMenus.tsx"
        say ""
        say "2. 删除以下菜单配置（如果存在）："
        say ""
        say "  {"
        say "    path: '/admin/#{plural_name}',"
        say "    name: '#{class_name}管理',"
        say "    icon: <FileTextOutlined />,"
        say "  },"
        say ""
        say "3. 如果不再需要，删除对应的图标导入"
      end
      say ""
      say "=" * 60
    end

    private

    def use_modal?
      return @use_modal unless @use_modal.nil?
      options[:modal] || (!options[:page] && true)
    end

    def template_prefix
      use_modal? ? "modal" : "page"
    end

    def attributes_names
      attributes.map(&:name)
    end

    def permitted_params
      attributes.map { |a| ":#{a.name}" }.join(", ")
    end

    def columns_for_table
      attributes.map { |a| { name: a.name, type: a.type } }
    end

    def js_default_value(type)
      case type
      when "integer", "decimal", "float" then "0"
      when "boolean" then "false"
      else "''"
      end
    end
  end
end
