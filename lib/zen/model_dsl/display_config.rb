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
    attr_reader :columns

    def initialize
      @columns = []
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
      { columns: @columns }
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
