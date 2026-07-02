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
      # 将路由添加到 admin 命名空间中
      # 在 delete "logout" 行之后插入，需要先添加换行符
      route_config = "\n    resources :#{plural_name}, only: [:index, :show, :new, :create, :edit, :update, :destroy]"
      
      insert_into_file "config/routes.rb", route_config, after: 'delete "logout", to: "sessions#destroy"'
    end

    def show_readme
      say ""
      say "=" * 60
      if behavior == :invoke
        say "生成完成！"
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
