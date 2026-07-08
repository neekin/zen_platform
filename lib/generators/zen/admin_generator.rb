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
    class_option :rich_text, type: :array, default: [], desc: "Fields that should use RichTextEditor"
    class_option :image, type: :array, default: [], desc: "Image upload fields"
    class_option :file, type: :array, default: [], desc: "File upload fields"
    class_option :tags, type: :array, default: [], desc: "Tag input fields"
    class_option :enums, type: :string, default: "", desc: "Enum fields as JSON (e.g. --enums='{\"status\":[\"draft\",\"active\"]}')"
    class_option :belongs_to, type: :array, default: [], desc: "Belongs_to associations (e.g. --belongs-to=category,user)"
    class_option :has_many, type: :array, default: [], desc: "Has_many associations (e.g. --has-many=comments,tags)"
    class_option :product, type: :string, default: "crud", desc: "Product form (crud, kanban, calendar)"

    def ask_form_style
      return if behavior == :revoke
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

    def create_policy
      template "#{template_prefix}/policy.rb.tt", "app/policies/#{singular_name}_policy.rb"
    end

    def register_permissions
      actions = %w[index show create update destroy]

      # 注入 RESOURCE_ACTIONS（声明新资源支持哪些操作）
      inject_into_file "app/models/permission.rb",
        after: "RESOURCE_ACTIONS = {" do
        "\n    \"#{class_name}\"      => %w[#{actions.join(' ')}],"
      end
    rescue StandardError => e
      say "⚠️ 权限注入失败: #{e.message}", :yellow
      say "请手动在 app/models/permission.rb 的 RESOURCE_ACTIONS 中添加 #{class_name}", :yellow
    end

    def create_index_page
      if kanban?
        template "products/kanban/index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Kanban.tsx"
      elsif calendar?
        template "products/calendar/index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Calendar.tsx"
      elsif gallery?
        template "products/gallery/index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Gallery.tsx"
      else
        template "#{template_prefix}/index.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Index.tsx"
      end
    end

    def create_page_files
      return if kanban?

      # Show 页面两种模式都需要
      if use_modal?
        template "modal/show.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Show.tsx"
      else
        template "page/show.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Show.tsx"
        template "page/new.tsx.tt", "app/frontend/pages/admin/#{plural_name}/New.tsx"
        template "page/edit.tsx.tt", "app/frontend/pages/admin/#{plural_name}/Edit.tsx"
      end
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

    # ============ 产品形态判断 ============

    def kanban?
      options[:product] == "kanban"
    end

    def calendar?
      options[:product] == "calendar"
    end

    def gallery?
      options[:product] == "gallery"
    end

    def crud?
      options[:product] == "crud" || options[:product].blank?
    end

    # ============ 看板配置 ============

    # 获取看板分组字段（第一个枚举字段）
    def kanban_group_field
      enum_fields.keys.first || "status"
    end

    # 获取看板标题字段（第一个 string 字段）
    def kanban_title_field
      string_attr = attributes.find { |a| a.type == "string" && !association_foreign_key?(a) }
      string_attr&.name || "title"
    end

    # 获取看板描述字段（第一个 text 字段）
    def kanban_description_field
      text_attr = attributes.find { |a| a.type == "text" }
      text_attr&.name
    end

    # 获取看板标签字段
    def kanban_tag_fields
      tag_fields_list
    end

    # 获取看板列配置
    def kanban_columns
      values = enum_fields[kanban_group_field] || []
      values = values.is_a?(Array) ? values : values.to_s.split(",")

      colors = [ "#1890ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2" ]
      values.each_with_index.map do |value, index|
        {
          id: value,
          title: value.titleize,
          color: colors[index % colors.length]
        }
      end
    end

    def attributes_names
      attributes.map(&:name)
    end

    def permitted_params
      params = attributes.map { |a| ":#{a.name}" }
      # 添加数组类型参数
      tag_fields_list.each { |f| params << "#{f}: []" }
      params.join(", ")
    end

    def columns_for_table
      attributes.map { |a| { name: a.name, type: a.type } }
    end

    # ============ 字段类型判断 ============

    def rich_text_fields
      options[:rich_text] || []
    end

    # 从选项中获取枚举字段
    # 语法: --enums='{"status":["draft","active","archived"]}'
    def enum_fields
      @enum_fields ||= begin
        return {} if options[:enums].blank?
        JSON.parse(options[:enums])
      rescue JSON::ParserError
        {}
      end
    end

    def image_fields
      options[:image] || []
    end

    def file_fields
      options[:file] || []
    end

    def tag_fields_list
      options[:tags] || []
    end

    def has_rich_text?
      rich_text_fields.any?
    end

    def has_enum?
      enum_fields.any?
    end

    def has_image?
      image_fields.any?
    end

    def has_file?
      file_fields.any?
    end

    def has_tags?
      tag_fields_list.any?
    end

    def rich_text_attributes
      attributes.select { |a| rich_text_fields.include?(a.name) }
    end

    def non_rich_text_attributes
      attributes.reject { |a| rich_text_fields.include?(a.name) }
    end

    def rich_text?(attr)
      rich_text_fields.include?(attr.name)
    end

    def enum?(attr)
      enum_fields.key?(attr.name)
    end

    def image?(attr)
      image_fields.include?(attr.name)
    end

    def file?(attr)
      file_fields.include?(attr.name)
    end

    def tags?(attr)
      tag_fields_list.include?(attr.name)
    end

    def enum_values(attr)
      return [] unless enum?(attr)
      values = enum_fields[attr.name]
      values.is_a?(Array) ? values : values.to_s.split(",")
    end

    # ============ 关联处理 ============

    def belongs_to_associations
      @belongs_to_associations ||= (options[:belongs_to] || []).map do |name|
        { name: name, foreign_key: "#{name}_id", display: :name }
      end
    end

    def has_many_associations
      @has_many_associations ||= (options[:has_many] || []).map do |name|
        { name: name }
      end
    end

    def has_belongs_to?
      belongs_to_associations.any?
    end

    def has_has_many?
      has_many_associations.any?
    end

    def has_associations?
      has_belongs_to? || has_has_many?
    end

    # 获取关联的外键字段（排除已定义的字段）
    def association_foreign_keys
      belongs_to_associations.map { |a| a[:foreign_key] } - attributes.map(&:name)
    end

    # 判断字段是否为关联外键
    def association_foreign_key?(attr)
      belongs_to_associations.any? { |a| a[:foreign_key] == attr.name }
    end

    # 获取关联名称（通过外键反查）
    def association_name_for_foreign_key(foreign_key)
      assoc = belongs_to_associations.find { |a| a[:foreign_key] == foreign_key }
      assoc&.dig(:name)
    end

    # ============ 字段类型处理 ============

    def js_type(type)
      case type
      when "integer", "decimal", "float" then "number"
      when "boolean" then "boolean"
      else "string"
      end
    end

    def js_default_value(type)
      case type
      when "integer", "decimal", "float" then "0"
      when "boolean" then "false"
      when "rich_text" then "'{}'"
      else "''"
      end
    end

    # 获取字段的表单组件类型
    def field_component(attr)
      return "RichTextEditor" if rich_text?(attr)
      return "EnumSelect" if enum?(attr)
      return "ImageUpload" if image?(attr)
      return "FileUpload" if file?(attr)
      return "TagInput" if tags?(attr)

      case attr.type
      when "text"
        "ProFormTextArea"
      when "boolean"
        "ProFormSwitch"
      when "integer", "decimal", "float"
        "ProFormDigit"
      when "date"
        "ProFormDatePicker"
      when "datetime"
        "ProFormDateTimePicker"
      else
        "ProFormText"
      end
    end

    # 获取字段的列表展示类型
    def list_display_type(attr)
      return :rich_text_summary if rich_text?(attr)
      return :enum_badge if enum?(attr)
      return :image_thumbnail if image?(attr)
      return :file_list if file?(attr)
      return :tag_list if tags?(attr)

      case attr.type
      when "boolean"
        :boolean_badge
      when "datetime"
        :relative_time
      else
        :text
      end
    end

    # 检查是否有需要特殊导入的组件
    def needs_special_imports?
      has_rich_text? || has_enum? || has_image? || has_file? || has_tags?
    end

    # 获取需要导入的组件列表
    def import_components
      components = []
      components << "RichTextEditor, RichTextViewer, getContentSummary" if has_rich_text?
      components << "ImageUpload" if has_image?
      components << "FileUpload" if has_file?
      components << "TagInput" if has_tags?
      components
    end
  end
end
