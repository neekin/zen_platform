# frozen_string_literal: true

module Zen
  class Resource
    class << self
      attr_reader :model_class, :resource_attributes, :resource_associations
      attr_reader :pagination_config, :sortable_fields, :views, :default_includes
      

      def model(klass)
        @model_class = klass
        # 自动注册时间戳字段（如果数据库有的话）
        return unless klass.respond_to?(:column_names)
        if klass.column_names.include?('created_at')
          @resource_attributes ||= {}
          @resource_attributes[:created_at] ||= AttributeDefinition.new(:created_at, :datetime, readonly: true)
        end
        if klass.column_names.include?('updated_at')
          @resource_attributes ||= {}
          @resource_attributes[:updated_at] ||= AttributeDefinition.new(:updated_at, :datetime, readonly: true)
        end
        # 注入工作流触发器回调
        
      end

            def attribute(name, type, **options)
        @resource_attributes ||= {}
        @resource_attributes[name.to_sym] = AttributeDefinition.new(name, type, **options)
      end

      def belongs_to(name, **options)
        @resource_associations ||= {}
        @resource_associations[name.to_sym] = AssociationDefinition.new(name, :belongs_to, **options)
      end

      def has_many(name, **options)
        @resource_associations ||= {}
        @resource_associations[name.to_sym] = AssociationDefinition.new(name, :has_many, **options)
      end

      def paginate(**options)
        @pagination_config = {
          per_page: (options[:per_page] || 20).to_i,
          max_per_page: (options[:max_per_page] || 100).to_i
        }
      end

      def sortable(*fields)
        @sortable_fields = fields.map(&:to_sym)
      end

      # 声明默认 eager load 的关联，避免 N+1 查询
      # 用法：includes :role, :notifications
      def includes(*associations)
        @default_includes = associations.map(&:to_sym)
      end

      def view(name, &block)
        @views ||= {}
        view_config = ViewConfig.new
        view_config.instance_eval(&block) if block
        @views[name.to_sym] = view_config
      end

      # 获取指定视图的配置
      def view_config(view_name)
        @views&.dig(view_name.to_sym) || @views&.values&.first
      end

      # 获取所有可搜索字段
      def searchable_fields
        resource_attributes&.select { |_, attr| attr.searchable? }&.keys || []
      end

      # 获取查询构建器
      def query
        QueryBuilder.new(self)
      end

      # 列表查询
      # @param params [Hash] 请求参数
      # @param view_name [Symbol] 视图名称（:admin, :api 等）
      # @param scope [ActiveRecord::Relation] 基础查询范围
      def list(params, view_name: :admin, scope: nil)
        vc = view_config(view_name)
        view_includes = vc&.association_includes&.map { |a| a[:name] } || []
        result = query.build(params, scope: scope, includes: view_includes)
        serializer = Serializer.new(self, view_name)
        serialized = serializer.serialize_collection(result[:records])
        Result.new(data: serialized, meta: result[:meta])
      end

      # 查找单条
      def find(id, view_name: :admin)
        record = model_class.find_by(id: id)
        return nil unless record

        serializer = Serializer.new(self, view_name)
        Result.new(data: serializer.serialize(record))
      end

      # 创建
      def create(params, view_name: :admin)
        record = model_class.new(params)
        if record.save
          serializer = Serializer.new(self, view_name)
          Result.new(data: serializer.serialize(record), success: true)
        else
          Result.new(errors: record.errors, success: false)
        end
      rescue ActiveRecord::RecordInvalid => e
        Result.new(errors: e.record.errors, success: false)
      end

      # 更新
      def update(id, params, view_name: :admin)
        record = model_class.find_by(id: id)
        return Result.new(errors: ["记录不存在"], success: false) unless record

        if record.update(params)
          serializer = Serializer.new(self, view_name)
          Result.new(data: serializer.serialize(record), success: true)
        else
          Result.new(errors: record.errors, success: false)
        end
      rescue ActiveRecord::RecordInvalid => e
        Result.new(errors: e.record.errors, success: false)
      end

      # 删除
      def destroy(id)
        record = model_class.find_by(id: id)
        return Result.new(errors: ["记录不存在"], success: false) unless record

        if record.destroy
          Result.new(success: true)
        else
          Result.new(errors: record.errors, success: false)
        end
      end

      # 懒加载关联数据
      # @param id [Integer] 记录 ID
      # @param association_name [Symbol] 关联名称
      # @param params [Hash] 分页参数（has_many 用）
      # @param view_name [Symbol] 视图名称
      def association_data(id, association_name, params = {}, view_name: :admin)
        record = model_class.find_by(id: id)
        return Result.new(errors: ["记录不存在"], success: false) unless record

        assoc_def = resource_associations&.[](association_name.to_sym)
        return Result.new(errors: ["关联 #{association_name} 未定义"], success: false) unless assoc_def
        return Result.new(errors: ["关联 #{association_name} 未配置懒加载"], success: false) unless assoc_def.lazy?

        if assoc_def.belongs_to?
          serialize_belongs_to(record, assoc_def, view_name)
        elsif assoc_def.has_many?
          serialize_has_many(record, assoc_def, params, view_name)
        else
          Result.new(errors: ["不支持的关联类型"], success: false)
        end
      end

            def serialize_belongs_to(record, assoc_def, view_name)
        associated = record.public_send(assoc_def.name)
        return Result.new(data: nil) unless associated

        assoc_resource = "#{assoc_def.name.to_s.camelize}Resource".safe_constantize
        if assoc_resource
          serializer = Serializer.new(assoc_resource, view_name)
          Result.new(data: serializer.serialize(associated))
        else
          Result.new(data: {
            id: associated.id,
            name: associated.public_send(assoc_def.display_field)
          })
        end
      end

      def serialize_has_many(record, assoc_def, params, view_name)
        association = record.public_send(assoc_def.name)

        per_page = (params[:per_page] || 20).to_i
        per_page = [per_page, 100].min
        page = (params[:page] || 1).to_i

        total = association.count
        records = association.offset((page - 1) * per_page).limit(per_page).to_a

        assoc_resource = "#{assoc_def.name.to_s.classify}Resource".safe_constantize
        data = if assoc_resource
          serializer = Serializer.new(assoc_resource, view_name)
          serializer.serialize_collection(records)
        else
          records.map { |r| { id: r.id, name: r.public_send(assoc_def.display_field) } }
        end

        Result.new(
          data: data,
          meta: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: (total.to_f / per_page).ceil
          }
        )
      end

      public

      # 从 ModelDsl 同步字段定义
      def sync_from_model!
        return unless model_class.respond_to?(:zen_fields)

        model_class.zen_fields.each do |name, field_def|
          next if resource_attributes&.key?(name) # 不覆盖已定义的

          options = {}
          options[:required] = field_def.required?
          options[:values] = field_def.enum_values if field_def.type == :enum
          options[:searchable] = Zen::ModelDsl::FieldTypes.searchable?(field_def.type)

          attribute name, field_def.type, **options
        end

        model_class.zen_associations.each do |name, assoc_def|
          next if resource_associations&.key?(name)

          if assoc_def.belongs_to?
            belongs_to name, display: assoc_def.display_field
          elsif assoc_def.has_many? || assoc_def.has_many_through?
            has_many name
          end
        end
      end
    end
  end
end
