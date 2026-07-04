# frozen_string_literal: true

module Zen
  module ModelDsl
    class DisplayConfig
    attr_reader :list_config, :form_config, :detail_config

    def initialize
      @list_config = ListConfig.new
      @form_config = FormConfig.new
      @detail_config = DetailConfig.new
    end

    def list(&block)
      @list_config.instance_eval(&block) if block
    end

    def form(&block)
      @form_config.instance_eval(&block) if block
    end

    def detail(&block)
      @detail_config.instance_eval(&block) if block
    end

    def to_h
      {
        list: @list_config.to_h,
        form: @form_config.to_h,
        detail: @detail_config.to_h
      }
    end
    end

    # 列表配置
    class ListConfig
    attr_reader :columns, :paginate_config, :searchable_fields, :filterable_fields

    def initialize
      @columns = []
      @paginate_config = nil  # nil 表示不启用分页
      @searchable_fields = []  # 空数组表示不启用搜索
      @filterable_fields = []  # 空数组表示不启用过滤
    end

    # 配置分页
    #
    # paginate per_page: 20, max_per_page: 100
    # paginate true  # 使用默认配置
    # paginate false  # 关闭分页
    def paginate(**options)
      if options == { true: true } || options.empty?
        @paginate_config = { per_page: 20, max_per_page: 100 }
      elsif options == { false: true }
        @paginate_config = nil
      else
        @paginate_config = {
          per_page: (options[:per_page] || 20).to_i,
          max_per_page: (options[:max_per_page] || 100).to_i
        }
      end
    end

    # 配置可搜索字段
    #
    # searchable :email, :username, :name
    # searchable true  # 自动检测可搜索字段（string、text 类型）
    # searchable false  # 关闭搜索
    def searchable(*fields)
      if fields.empty?
        @searchable_fields = true  # 自动检测
      elsif fields == [ false ]
        @searchable_fields = []
      else
        @searchable_fields = fields.map(&:to_sym)
      end
    end

    # 配置可过滤字段
    #
    # filterable :role, :status, :created_at
    # filterable true  # 自动检测可过滤字段（enum、boolean、date、datetime 类型）
    # filterable false  # 关闭过滤
    def filterable(*fields)
      if fields.empty?
        @filterable_fields = true  # 自动检测
      elsif fields == [ false ]
        @filterable_fields = []
      else
        @filterable_fields = fields.map(&:to_sym)
      end
    end

    # 定义列表列
    #
    # column :title, link: true
    # column :status, badge: true
    # column :category, display: :name
    # column :created_at, format: :relative_time
    # column :cover, thumbnail: true
    # column :actions, width: 200
    def column(name, **options)
      @columns << { name: name.to_sym }.merge(options)
    end

    def to_h
      {
        columns: @columns,
        paginate: @paginate_config,
        searchable: @searchable_fields,
        filterable: @filterable_fields
      }
    end
    end

    # 表单配置
    class FormConfig
    attr_reader :sections

    def initialize
      @sections = []
      @current_section = nil
    end

    # 定义表单分区
    #
    # section "基本信息" do
    #   field :title
    #   field :status, as: :radio
    # end
    def section(title, &block)
      @current_section = { title: title, fields: [] }
      instance_eval(&block) if block
      @sections << @current_section
      @current_section = nil
    end

    # 定义表单字段
    def field(name, **options)
      field_config = { name: name.to_sym }.merge(options)
      if @current_section
        @current_section[:fields] << field_config
      else
        # 没有 section 的字段放到默认 section
        default_section = @sections.find { |s| s[:title] == "default" }
        unless default_section
          default_section = { title: "default", fields: [] }
          @sections << default_section
        end
        default_section[:fields] << field_config
      end
    end

    def to_h
      { sections: @sections }
    end
    end

    # 详情配置
    class DetailConfig
    attr_reader :sections, :associations

    def initialize
      @sections = []
      @associations = []
      @current_section = nil
    end

    # 定义详情分区
    def section(title, &block)
      @current_section = { title: title, fields: [] }
      instance_eval(&block) if block
      @sections << @current_section
      @current_section = nil
    end

    # 定义详情字段
    def field(name, **options)
      field_config = { name: name.to_sym }.merge(options)
      if @current_section
        @current_section[:fields] << field_config
      else
        default_section = @sections.find { |s| s[:title] == "default" }
        unless default_section
          default_section = { title: "default", fields: [] }
          @sections << default_section
        end
        default_section[:fields] << field_config
      end
    end

    # 定义关联展示
    def has_many(name, **options)
      @associations << { name: name.to_sym, type: :has_many }.merge(options)
    end

    def belongs_to(name, **options)
      @associations << { name: name.to_sym, type: :belongs_to }.merge(options)
    end

    def to_h
      { sections: @sections, associations: @associations }
    end
    end
  end
end
